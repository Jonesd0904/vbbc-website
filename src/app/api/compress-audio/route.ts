import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// Get FFmpeg binary path
function getFFmpegPath(): string {
  try {
    // Try to use ffmpeg-static
    const ffmpegStatic = require('ffmpeg-static')
    return ffmpegStatic
  } catch {
    // Fallback to system ffmpeg
    return 'ffmpeg'
  }
}

export async function POST(request: NextRequest) {
  let inputPath = ''
  let outputPath = ''
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const bitrate = formData.get('bitrate')?.toString() || '64'
    const ffmpegPath = getFFmpegPath()
    
    // Create temp directory
    const tempDir = join(tmpdir(), 'audio-compress')
    await mkdir(tempDir, { recursive: true })
    
    // Generate unique filenames
    const timestamp = Date.now()
    const ext = file.name.match(/\.[^/.]+$/)?.[0] || '.mp3'
    inputPath = join(tempDir, `input-${timestamp}${ext}`)
    outputPath = join(tempDir, `output-${timestamp}.mp3`)
    
    // Write uploaded file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(inputPath, buffer)
    
    console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) using FFmpeg...`)
    
    // Run FFmpeg compression
    // -i: input file
    // -vn: no video
    // -ac 1: mono
    // -ar 44100: sample rate
    // -b:a: bitrate
    // -y: overwrite
    const args = [
      '-i', inputPath,
      '-vn',
      '-ac', '1',
      '-ar', '44100',
      '-b:a', `${bitrate}k`,
      '-y',
      outputPath
    ]
    
    await execFileAsync(ffmpegPath, args, { timeout: 600000 }) // 10 minute timeout
    
    // Read compressed file
    const compressedBuffer = await readFile(outputPath)
    
    const originalSize = file.size
    const compressedSize = compressedBuffer.length
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(0)
    
    console.log(`Compression complete: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressedSize / 1024 / 1024).toFixed(1)}MB (${reduction}% smaller)`)
    
    // Cleanup temp files
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
    
    // Return compressed file
    return new NextResponse(compressedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}_compressed.mp3"`,
        'X-Original-Size': String(originalSize),
        'X-Compressed-Size': String(compressedSize),
      }
    })
    
  } catch (error) {
    // Cleanup on error
    if (inputPath) await unlink(inputPath).catch(() => {})
    if (outputPath) await unlink(outputPath).catch(() => {})
    
    console.error('Compression error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's an FFmpeg not found error
    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      return NextResponse.json({ 
        error: 'FFmpeg not available. Please install ffmpeg-static: npm install ffmpeg-static',
        details: errorMessage
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Compression failed',
      details: errorMessage
    }, { status: 500 })
  }
}
