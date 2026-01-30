// Audio compression utility using Web Audio API and lamejs
// Automatically compresses audio files to reduce size for upload

// We'll dynamically load lamejs from CDN
let lamejs: any = null;

async function loadLamejs(): Promise<any> {
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
  targetBitrate?: number; // kbps, default 64 for speech
  maxSizeMB?: number; // Max size before compression kicks in
  onProgress?: (progress: number, status: string) => void;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

// Convert AudioBuffer to MP3 using lamejs
async function audioBufferToMp3(
  audioBuffer: AudioBuffer,
  bitrate: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadLamejs();
  
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  
  // For speech/sermons, mono is fine and halves the size
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, bitrate);
  
  // Get audio data - convert to mono if stereo
  let samples: Float32Array;
  if (channels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    samples = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      samples[i] = (left[i] + right[i]) / 2;
    }
  } else {
    samples = audioBuffer.getChannelData(0);
  }
  
  // Convert to 16-bit PCM
  const pcmData = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Encode in chunks
  const mp3Data: Int8Array[] = [];
  const chunkSize = 1152;
  const totalChunks = Math.ceil(pcmData.length / chunkSize);
  
  for (let i = 0; i < pcmData.length; i += chunkSize) {
    const chunk = pcmData.subarray(i, i + chunkSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }
    
    if (onProgress) {
      const progress = Math.min(100, Math.round((i / pcmData.length) * 100));
      onProgress(progress);
    }
  }
  
  // Flush remaining data
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(new Int8Array(mp3buf));
  }
  
  // Combine all chunks
  const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of mp3Data) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return new Blob([result], { type: 'audio/mp3' });
}

// Decode audio file to AudioBuffer
async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return await audioContext.decodeAudioData(arrayBuffer);
}

// Main compression function
export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    targetBitrate = 64, // 64kbps is great for speech/sermons
    maxSizeMB = 40, // Compress if over 40MB
    onProgress,
  } = options;
  
  const originalSize = file.size;
  const sizeMB = originalSize / (1024 * 1024);
  
  // If file is small enough, don't compress
  if (sizeMB <= maxSizeMB) {
    return {
      blob: file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
    };
  }
  
  onProgress?.(0, 'Analyzing audio...');
  
  try {
    // Decode the audio file
    onProgress?.(10, 'Decoding audio...');
    const audioBuffer = await decodeAudioFile(file);
    
    // Compress to MP3
    onProgress?.(20, 'Optimizing audio...');
    const compressedBlob = await audioBufferToMp3(
      audioBuffer,
      targetBitrate,
      (progress) => {
        // Map 0-100 to 20-90
        const mappedProgress = 20 + (progress * 0.7);
        onProgress?.(mappedProgress, 'Optimizing audio...');
      }
    );
    
    onProgress?.(95, 'Finalizing...');
    
    return {
      blob: compressedBlob,
      originalSize,
      compressedSize: compressedBlob.size,
      wasCompressed: true,
    };
  } catch (error) {
    console.error('Compression failed, using original file:', error);
    // If compression fails, return original file
    return {
      blob: file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
    };
  }
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
