// Audio compression utility
// Note: Next.js App Router has a ~4MB body limit that cannot be easily changed.
// For files over 50MB, users should compress externally.

export interface CompressionOptions {
  targetBitrate?: number;
  onProgress?: (progress: number, status: string) => void;
}

// Check if file needs compression (over 50MB Supabase limit)
export function needsCompression(file: File, maxSizeMB: number = 50): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB > maxSizeMB;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Compress audio - for large files, shows instructions for external compression
export async function compressAudio(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { targetBitrate = 64, onProgress } = options;
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Skip compression for small files
  if (fileSizeMB <= 50) {
    onProgress?.(100, 'File under 50MB, no compression needed');
    return file;
  }
  
  // For files over 50MB, show instructions to compress externally
  // Next.js App Router has a ~4MB body limit that prevents server-side compression
  const errorMsg = 
    `Your file is ${fileSizeMB.toFixed(1)}MB - too large to upload directly.\n\n` +
    `Supabase storage has a 50MB limit. Please compress your audio file first:\n\n` +
    `1. Go to freeconvert.com/mp3-compressor\n` +
    `2. Upload your audio file\n` +
    `3. Set "Audio Bitrate" to 64 kbps\n` +
    `4. Set "Audio Channels" to Mono\n` +
    `5. Click Convert and download\n\n` +
    `A 60-minute sermon will compress from ~60MB to ~30MB.\n` +
    `Then upload the compressed file here.`;
  
  throw new Error(errorMsg);
}
