import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class ImageService {
  /**
   * Process and compress image for web
   * @param inputPath Path to original uploaded image
   * @returns Path to processed image
   */
  static async processImage(inputPath: string): Promise<string> {
    try {
      const outputFilename = `processed-${path.basename(inputPath, path.extname(inputPath))}.webp`;
      const outputPath = path.join(path.dirname(inputPath), outputFilename);

      await sharp(inputPath)
        .resize({ width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 }) // WebP for better compression
        .toFile(outputPath);

      // Clean up original file to save space
      try {
        fs.unlinkSync(inputPath);
      } catch (err) {
        console.error('Failed to delete original image:', err);
      }

      return outputFilename;
    } catch (error) {
      console.error('Image processing failed:', error);
      // Return original filename if processing fails
      return path.basename(inputPath);
    }
  }

  /**
   * Calculate perceptual hash of an image for duplicate detection
   * We use a simple average hash algorithm for this implementation
   * @param imagePath Path to the image
   */
  static async generateHash(imagePath: string): Promise<string> {
    try {
      // 1. Resize to 8x8, grayscale
      const buffer = await sharp(imagePath)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

      // 2. Calculate average pixel value
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i];
      }
      const average = sum / buffer.length;

      // 3. Compute hash bits (1 if >= average, 0 if < average)
      let hash = '';
      for (let i = 0; i < buffer.length; i++) {
        hash += buffer[i] >= average ? '1' : '0';
      }

      // 4. Convert binary to hex
      return this.binaryToHex(hash);
    } catch (error) {
      console.error('Hash generation failed:', error);
      // Fallback to simple MD5 if image processing fails
      const fileBuffer = fs.readFileSync(imagePath);
      return crypto.createHash('md5').update(fileBuffer).digest('hex');
    }
  }

  /**
   * Compare two hashes to see if images are duplicates
   * Higher similarity = more likely a duplicate
   */
  static calculateSimilarity(hash1: string, hash2: string): number {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
    
    // Convert hex back to binary
    const bin1 = this.hexToBinary(hash1);
    const bin2 = this.hexToBinary(hash2);
    
    let matches = 0;
    for (let i = 0; i < bin1.length; i++) {
      if (bin1[i] === bin2[i]) matches++;
    }
    
    return (matches / bin1.length) * 100;
  }

  private static binaryToHex(binary: string): string {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
      const chunk = binary.slice(i, i + 4);
      hex += parseInt(chunk, 2).toString(16);
    }
    return hex;
  }

  private static hexToBinary(hex: string): string {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
      const chunk = parseInt(hex[i], 16).toString(2).padStart(4, '0');
      binary += chunk;
    }
    return binary;
  }
}
