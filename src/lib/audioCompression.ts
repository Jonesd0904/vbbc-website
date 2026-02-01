// Browser-based Audio Compression Utility
// Uses Web Audio API for decoding and lamejs for MP3 encoding
// This runs entirely in the browser - no server needed!

export interface CompressionOptions {
  targetBitrate?: number;        // kbps (default: 64)
  targetSampleRate?: number;     // Hz (default: 22050 for speech)
  mono?: boolean;                // Convert to mono (default: true)
  onProgress?: (progress: number, status: string) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  duration: number;
}

// Maximum file size that can be processed in-browser (40MB to be safe)
const MAX_BROWSER_COMPRESSION_SIZE_MB = 40;

// Maximum uploadable size to Supabase
const MAX_UPLOAD_SIZE_MB = 50;

// Check if file needs compression (over threshold)
export function needsCompression(file: File, maxSizeMB: number = 50): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
}

// Check if file is too large to process in browser
export function isFileTooLarge(file: File): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > MAX_UPLOAD_SIZE_MB;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Get the error message for files that are too large
export function getLargeFileErrorMessage(file: File): string {
  const fileSizeMB = file.size / (1024 * 1024);
  return `File is too large (${fileSizeMB.toFixed(1)}MB).\n\n` +
    `The maximum upload size is 50MB, and browser-based compression can't handle files this large without freezing.\n\n` +
    `Please compress your audio file using one of these free online tools:\n\n` +
    `• https://www.freeconvert.com/mp3-compressor\n` +
    `• https://www.onlineconverter.com/compress-mp3\n\n` +
    `Recommended settings for sermons:\n` +
    `• Bitrate: 64 kbps (great for speech)\n` +
    `• Channels: Mono\n` +
    `• Sample Rate: 22050 Hz\n\n` +
    `A 60-minute sermon at these settings = ~30MB`;
}

// Dynamically load lamejs
async function loadLamejs(): Promise<typeof import('lamejs')> {
  // @ts-expect-error - lamejs doesn't have proper types
  const lamejs = await import('lamejs');
  return lamejs.default || lamejs;
}

// Resample audio data to target sample rate
function resampleAudioData(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const fraction = srcIndex - srcIndexFloor;
    
    // Linear interpolation
    result[i] = audioData[srcIndexFloor] * (1 - fraction) + audioData[srcIndexCeil] * fraction;
  }

  return result;
}

// Convert Float32Array to Int16Array for lamejs
function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp the value
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit integer
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

// Mix stereo to mono
function mixToMono(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const mono = new Float32Array(leftChannel.length);
  for (let i = 0; i < leftChannel.length; i++) {
    mono[i] = (leftChannel[i] + rightChannel[i]) / 2;
  }
  return mono;
}

/**
 * Compress audio file in the browser using Web Audio API and lamejs
 * Works with any audio format the browser can decode (MP3, WAV, M4A, OGG, etc.)
 * 
 * NOTE: Files over 50MB cannot be processed in the browser (will freeze/crash)
 * and must be compressed externally before upload.
 */
export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    targetBitrate = 64,
    targetSampleRate = 22050,
    mono = true,
    onProgress
  } = options;

  const originalSize = file.size;
  const fileSizeMB = originalSize / (1024 * 1024);

  // If file is over 50MB, throw a helpful error
  // Browser-based compression freezes/crashes for large files
  if (fileSizeMB > MAX_UPLOAD_SIZE_MB) {
    onProgress?.(0, 'File too large - external compression required');
    throw new Error(getLargeFileErrorMessage(file));
  }

  // If file is small enough (under threshold for browser compression), return as-is
  if (fileSizeMB <= MAX_BROWSER_COMPRESSION_SIZE_MB) {
    onProgress?.(100, 'File size OK - no compression needed');
    return file;
  }

  // File is between 40-50MB - try to compress it in browser
  onProgress?.(5, `Compressing ${formatFileSize(originalSize)}...`);

  try {
    // Step 1: Read file as ArrayBuffer
    onProgress?.(5, 'Reading audio file...');
    const arrayBuffer = await file.arrayBuffer();

    // Step 2: Decode audio using Web Audio API
    onProgress?.(10, 'Decoding audio data...');
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (decodeError) {
      throw new Error(`Could not decode audio file. The file may be corrupted or in an unsupported format. Error: ${decodeError}`);
    }

    const originalSampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const duration = audioBuffer.duration;

    onProgress?.(20, `Audio: ${Math.round(duration)}s, ${originalSampleRate}Hz, ${numberOfChannels}ch`);

    // Step 3: Extract channel data
    onProgress?.(25, 'Processing audio channels...');
    let leftChannel = audioBuffer.getChannelData(0);
    let rightChannel = numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

    // Step 4: Convert to mono if requested
    let audioData: Float32Array;
    if (mono) {
      onProgress?.(30, 'Converting to mono...');
      audioData = mixToMono(leftChannel, rightChannel);
    } else {
      audioData = leftChannel; // For stereo encoding, we'd need different handling
    }

    // Step 5: Resample to target sample rate
    onProgress?.(35, `Resampling ${originalSampleRate}Hz to ${targetSampleRate}Hz...`);
    const resampledData = resampleAudioData(audioData, originalSampleRate, targetSampleRate);

    // Step 6: Convert to 16-bit PCM
    onProgress?.(40, 'Preparing for MP3 encoding...');
    const pcmData = floatTo16BitPCM(resampledData);

    // Step 7: Load lamejs and encode to MP3
    onProgress?.(45, 'Loading MP3 encoder...');
    const lamejs = await loadLamejs();

    onProgress?.(50, `Encoding MP3 at ${targetBitrate}kbps...`);
    
    // Create MP3 encoder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mp3encoder = new (lamejs as any).Mp3Encoder(1, targetSampleRate, targetBitrate);
    
    const mp3Data: Int8Array[] = [];
    const sampleBlockSize = 1152; // Must be a multiple of 576 for lamejs
    const totalBlocks = Math.ceil(pcmData.length / sampleBlockSize);

    // Encode in chunks
    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
      const chunk = pcmData.subarray(i, Math.min(i + sampleBlockSize, pcmData.length));
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }

      // Update progress (50-90% for encoding)
      const blockNum = Math.floor(i / sampleBlockSize);
      const encodeProgress = 50 + Math.round((blockNum / totalBlocks) * 40);
      if (blockNum % 100 === 0) {
        onProgress?.(encodeProgress, `Encoding: ${Math.round((blockNum / totalBlocks) * 100)}%`);
      }
    }

    // Flush encoder
    const mp3Final = mp3encoder.flush();
    if (mp3Final.length > 0) {
      mp3Data.push(new Int8Array(mp3Final));
    }

    onProgress?.(92, 'Finalizing compressed file...');

    // Step 8: Combine all MP3 chunks
    const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
    const mp3Array = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of mp3Data) {
      mp3Array.set(new Uint8Array(chunk.buffer), offset);
      offset += chunk.length;
    }

    // Step 9: Create compressed file
    const compressedBlob = new Blob([mp3Array], { type: 'audio/mp3' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const compressedFile = new File([compressedBlob], `${baseName}.mp3`, {
      type: 'audio/mp3',
      lastModified: Date.now()
    });

    const compressedSize = compressedFile.size;
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

    onProgress?.(100, `Compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${compressionRatio}% smaller)`);

    // Clean up
    await audioContext.close();

    return compressedFile;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown compression error';
    onProgress?.(0, `Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Compress audio with detailed result information
 */
export async function compressAudioWithDetails(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const originalSize = file.size;
  const compressedFile = await compressAudio(file, options);
  const compressedSize = compressedFile.size;

  // Get duration from original file
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;
  await audioContext.close();

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
    duration
  };
}

/**
 * Batch compress multiple audio files
 * Processes files sequentially to avoid memory issues
 */
export async function batchCompressAudio(
  files: File[],
  options: CompressionOptions & {
    onFileProgress?: (fileIndex: number, fileName: string, progress: number, status: string) => void;
    onFileComplete?: (fileIndex: number, result: CompressionResult) => void;
    onFileError?: (fileIndex: number, error: Error) => void;
  } = {}
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const { onFileProgress, onFileComplete, onFileError, ...compressionOptions } = options;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await compressAudioWithDetails(file, {
        ...compressionOptions,
        onProgress: (progress, status) => {
          onFileProgress?.(i, file.name, progress, status);
        }
      });
      
      results.push(result);
      onFileComplete?.(i, result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onFileError?.(i, err);
      // Continue with next file
    }
  }

  return results;
}

/**
 * Check if browser supports Web Audio API
 */
export function isCompressionSupported(): boolean {
  return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
}

/**
 * Get estimated compressed size
 * This is a rough estimate based on bitrate and duration
 */
export async function estimateCompressedSize(
  file: File,
  targetBitrate: number = 64
): Promise<{ estimatedSize: number; duration: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    await audioContext.close();

    // Estimate: bitrate (kbps) * duration (s) / 8 (bits to bytes) * 1000 (kilo)
    const estimatedSize = Math.round((targetBitrate * duration * 1000) / 8);

    return { estimatedSize, duration };
  } catch {
    // If we can't decode, return a rough estimate based on common ratios
    return { 
      estimatedSize: Math.round(file.size * 0.25), // Assume ~75% compression
      duration: 0 
    };
  }
}
