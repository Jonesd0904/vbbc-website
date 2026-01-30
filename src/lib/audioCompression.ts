// Audio compression utility - uses server-side FFmpeg
// Runs on the server so it won't freeze the browser

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

// Compress audio using server-side API
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
  
  console.log(`Compressing ${fileSizeMB.toFixed(1)}MB file to ~${targetBitrate}kbps...`);
  onProgress?.(5, 'Uploading to server for compression...');
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bitrate', String(targetBitrate));
    
    // Upload to compression API
    const response = await fetch('/api/compress-audio', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Compression failed');
    }
    
    onProgress?.(80, 'Downloading compressed file...');
    
    // Get compressed file
    const compressedBlob = await response.blob();
    const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
    const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
    
    // Create File object
    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.mp3';
    const compressedFile = new File([compressedBlob], newFileName, { type: 'audio/mp3' });
    
    const newSizeMB = compressedFile.size / (1024 * 1024);
    const reduction = ((1 - newSizeMB / fileSizeMB) * 100).toFixed(0);
    
    console.log(`Compression complete: ${fileSizeMB.toFixed(1)}MB → ${newSizeMB.toFixed(1)}MB (${reduction}% smaller)`);
    onProgress?.(100, `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
    
    return compressedFile;
    
  } catch (error) {
    console.error('Compression failed:', error);
    onProgress?.(0, 'Compression failed');
    throw error;
  }
}
