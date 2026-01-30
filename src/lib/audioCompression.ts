// Audio compression utility for sermon uploads
// Uses Web Audio API + lamejs for browser-based MP3 encoding
// Automatically compresses large files before upload

// Dynamically load lamejs from CDN
let lamejs: any = null;

async function loadLameJs(): Promise<any> {
  if (lamejs) return lamejs;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
    script.onload = () => {
      lamejs = (window as any).lamejs;
      resolve(lamejs);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export interface CompressionOptions {
  targetBitrate?: number; // kbps (default: 64 for speech)
  mono?: boolean; // Convert to mono (default: true for speech)
  sampleRate?: number; // Target sample rate (default: 44100)
  maxSizeMB?: number; // Max file size in MB before compression kicks in
  onProgress?: (progress: number, status: string) => void;
}

const defaultOptions: CompressionOptions = {
  targetBitrate: 64, // 64kbps is excellent for speech/sermons
  mono: true, // Mono is fine for sermons and halves the size
  sampleRate: 44100,
  maxSizeMB: 40, // Compress if over 40MB to stay under 50MB limit
};

// Check if file needs compression
export function needsCompression(file: File, maxSizeMB: number = 40): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Main compression function
export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options };
  
  // Check if compression is needed
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB <= opts.maxSizeMB!) {
    console.log(`File is ${fileSizeMB.toFixed(1)}MB, no compression needed`);
    opts.onProgress?.(100, 'Ready');
    return file;
  }
  
  console.log(`File is ${fileSizeMB.toFixed(1)}MB, compressing to ~${opts.targetBitrate}kbps...`);
  opts.onProgress?.(5, 'Loading encoder...');
  
  try {
    // Load lamejs library
    await loadLameJs();
    
    opts.onProgress?.(10, 'Decoding audio...');
    
    // Decode the audio file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    opts.onProgress?.(20, 'Processing...');
    
    // Get audio data
    const sampleRate = opts.sampleRate || audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    
    // Get left channel
    let leftChannel = audioBuffer.getChannelData(0);
    
    // If converting to mono and source is stereo, mix down
    if (opts.mono && audioBuffer.numberOfChannels > 1) {
      const right = audioBuffer.getChannelData(1);
      const mixed = new Float32Array(leftChannel.length);
      for (let i = 0; i < leftChannel.length; i++) {
        mixed[i] = (leftChannel[i] + right[i]) / 2;
      }
      leftChannel = mixed;
    }
    
    opts.onProgress?.(30, 'Compressing audio...');
    
    // Resample if needed
    if (audioBuffer.sampleRate !== sampleRate) {
      const ratio = sampleRate / audioBuffer.sampleRate;
      const newLength = Math.round(leftChannel.length * ratio);
      const resampled = new Float32Array(newLength);
      
      for (let i = 0; i < newLength; i++) {
        const srcIndex = i / ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, leftChannel.length - 1);
        const t = srcIndex - srcIndexFloor;
        resampled[i] = leftChannel[srcIndexFloor] * (1 - t) + leftChannel[srcIndexCeil] * t;
      }
      
      leftChannel = resampled;
    }
    
    // Convert Float32 to Int16
    const leftInt16 = new Int16Array(leftChannel.length);
    for (let i = 0; i < leftChannel.length; i++) {
      const s = Math.max(-1, Math.min(1, leftChannel[i]));
      leftInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Encode to MP3
    const mp3Data: Int8Array[] = [];
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, opts.targetBitrate);
    
    const blockSize = 1152;
    const totalBlocks = Math.ceil(leftInt16.length / blockSize);
    
    for (let i = 0; i < leftInt16.length; i += blockSize) {
      const chunk = leftInt16.subarray(i, Math.min(i + blockSize, leftInt16.length));
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
      
      // Report progress (30% to 90%)
      if (opts.onProgress) {
        const currentBlock = Math.floor(i / blockSize);
        const encodeProgress = 30 + (currentBlock / totalBlocks) * 60;
        opts.onProgress(Math.min(encodeProgress, 90), 'Compressing audio...');
      }
    }
    
    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    opts.onProgress?.(95, 'Finalizing...');
    
    // Create blob from MP3 data - combine all chunks into single Uint8Array
    const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of mp3Data) {
      // Create a new Uint8Array from the Int8Array data
      const uint8Chunk = new Uint8Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        uint8Chunk[i] = chunk[i] & 0xFF;
      }
      combined.set(uint8Chunk, offset);
      offset += chunk.length;
    }
    const blob = new Blob([combined], { type: 'audio/mp3' });
    
    // Create new file with original name but .mp3 extension
    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.mp3';
    const compressedFile = new File([blob], newFileName, { type: 'audio/mp3' });
    
    const newSizeMB = compressedFile.size / (1024 * 1024);
    const reduction = ((1 - newSizeMB / fileSizeMB) * 100).toFixed(0);
    console.log(`Compression complete: ${fileSizeMB.toFixed(1)}MB → ${newSizeMB.toFixed(1)}MB (${reduction}% smaller)`);
    
    opts.onProgress?.(100, `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
    
    // Clean up
    await audioContext.close();
    
    return compressedFile;
    
  } catch (error) {
    console.error('Compression failed:', error);
    opts.onProgress?.(100, 'Compression failed, using original');
    // Return original file if compression fails
    return file;
  }
}
