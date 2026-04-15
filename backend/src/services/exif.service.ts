import exifr from 'exifr';

export interface ExifData {
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  timestamp?: Date;
  camera?: {
    make?: string;
    model?: string;
  };
  software?: string;
  isValid: boolean;
  validationScore: number;
  warnings: string[];
}

export class ExifService {
  static async extractExif(filePath: string): Promise<ExifData> {
    try {
      const exif = await exifr.parse(filePath, {
        gps: true,
        pick: [
          'GPSLatitude',
          'GPSLongitude',
          'GPSAltitude',
          'DateTime',
          'DateTimeOriginal',
          'Make',
          'Model',
          'Software',
          'Orientation'
        ]
      });

      if (!exif) {
        return { isValid: false, validationScore: 0, warnings: ['No EXIF data found'] };
      }

      const warnings: string[] = [];
      let score = 0;

      // Extract GPS
      let gpsData;
      if (exif.latitude && exif.longitude) {
        gpsData = {
          latitude: exif.latitude,
          longitude: exif.longitude,
          altitude: exif.GPSAltitude
        };
        score += 40; // GPS is most important
      } else {
        warnings.push('No GPS data found');
      }

      // Extract timestamp
      let timestamp;
      if (exif.DateTimeOriginal || exif.DateTime) {
        timestamp = new Date(exif.DateTimeOriginal || exif.DateTime);
        
        // Check if timestamp is recent (within 24 hours)
        const hoursSincePhoto = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursSincePhoto <= 24) {
          score += 20;
        } else {
          warnings.push('Photo is older than 24 hours');
          score += 5;
        }

        // Check if timestamp is not in future
        if (timestamp > new Date()) {
          warnings.push('Photo timestamp is in the future');
          score -= 10;
        }
      } else {
        warnings.push('No timestamp found');
      }

      // Extract camera info
      let camera;
      if (exif.Make || exif.Model) {
        camera = { make: exif.Make, model: exif.Model };
        score += 15;
      } else {
        warnings.push('No camera info found');
      }

      // Check for editing software
      const software = exif.Software;
      if (software) {
        const editingSoftware = [
          'photoshop', 'gimp', 'paint', 'screenshot', 'snipping', 'lightroom'
        ];
        const isEdited = editingSoftware.some(s => 
          software.toLowerCase().includes(s)
        );

        if (isEdited) {
          warnings.push(`Photo may be edited (${software})`);
          score -= 20;
        } else {
          score += 10;
        }
      }

      // Ensure score is between 0-100
      score = Math.max(0, Math.min(100, score));

      return {
        gps: gpsData,
        timestamp,
        camera,
        software,
        isValid: score >= 40, // Minimum 40% score to be valid
        validationScore: score,
        warnings
      };
    } catch (error: any) {
      console.error('EXIF extraction error:', error);
      return { isValid: false, validationScore: 0, warnings: ['Failed to extract EXIF data'] };
    }
  }

  static async validateGPSMatch(
    exifGPS: { latitude: number; longitude: number },
    userGPS: { latitude: number; longitude: number },
    toleranceMeters: number = 100
  ): Promise<{ isMatch: boolean; distance: number }> {
    const distance = this.calculateDistance(
      exifGPS.latitude,
      exifGPS.longitude,
      userGPS.latitude,
      userGPS.longitude
    );

    return {
      isMatch: distance <= toleranceMeters,
      distance: Math.round(distance)
    };
  }

  // Haversine formula for distance calculation
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
