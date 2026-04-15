import { PrismaClient, Leak } from '@prisma/client';
import { ExifService } from './exif.service';
import { ImageService } from './image.service';
import { ClusteringService } from './clustering.service';
import path from 'path';

const prisma = new PrismaClient();

export class LeakService {
  static async reportLeak(data: any, file: Express.Multer.File, userId: string): Promise<Leak> {
    try {
      // 1. Process image for validation
      const exifData = await ExifService.extractExif(file.path);
      const imageHash = await ImageService.generateHash(file.path);

      // 2. Format location
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);

      // 3. Prevent duplicate leaks (fraud prevention)
      // Check if same user reported nearby recently OR if photo hash matches
      const recentLeaks = await prisma.leak.findMany({
        where: {
          status: { not: 'REJECTED' },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
        }
      });

      // Simple dedup logic
      for (const leak of recentLeaks) {
        if (leak.photoHash && ImageService.calculateSimilarity(leak.photoHash, imageHash) > 90) {
          throw new Error('This image has already been reported.');
        }
      }

      // 4. Calculate Intelligence metrics
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const trustScore = user?.trustScore || 50;

      const priorityScore = ClusteringService.calculatePriority(
        data.severity,
        data.flowRate,
        trustScore
      );

      const waterLossRate = ClusteringService.calculateWaterLoss(data.flowRate);

      // 5. Optimize image for storage
      const optimizedFilename = await ImageService.processImage(file.path);

      // 6. Save to database
      const leak = await prisma.leak.create({
        data: {
          latitude,
          longitude,
          address: data.address,
          landmark: data.landmark,
          photoUrl: optimizedFilename, // Just save filename, frontend prepends server URL
          photoHash: imageHash,
          exifData: exifData as any,
          severity: data.severity,
          category: data.category,
          flowRate: data.flowRate,
          description: data.description,
          priorityScore,
          waterLossRate,
          reporterId: userId,
          isFlagged: !exifData.isValid,
          flagReason: exifData.warnings.join(', '),
          status: exifData.isValid ? 'VERIFIED' : 'REPORTED'
        }
      });

      // 7. Async: Assign to cluster
      setTimeout(() => {
        ClusteringService.assignToCluster(leak).catch(console.error);
      }, 0);

      // 8. Reward user points
      if (exifData.isValid) {
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: 10 } }
        });
      }

      return leak;
    } catch (error: any) {
      console.error('Leak reporting failed:', error);
      throw new Error(error.message || 'Failed to report leak');
    }
  }

  static async getLeaks(params: { status?: string; bounds?: string; limit?: number }) {
    const query: any = {};
    
    // Status filter
    if (params.status) {
      if (params.status !== 'ALL') {
        query.status = params.status;
      }
    }

    // Geographic bounds filter (SW_Lat,SW_Lng,NE_Lat,NE_Lng)
    if (params.bounds) {
      const [swLat, swLng, neLat, neLng] = params.bounds.split(',').map(parseFloat);
      query.latitude = { gte: swLat, lte: neLat };
      query.longitude = { gte: swLng, lte: neLng };
    }

    return await prisma.leak.findMany({
      where: query,
      include: {
        reporter: { select: { name: true, points: true } },
        _count: { select: { upvotes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 100
    });
  }

  static async getLeakById(id: string) {
    return await prisma.leak.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, points: true, role: true } },
        assignedCrew: { select: { name: true, phone: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { upvotes: true } }
      }
    });
  }

  static async getMyLeaks(userId: string) {
    return await prisma.leak.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async upvoteLeak(leakId: string, userId: string) {
    // Check if already upvoted
    const existing = await prisma.leakUpvote.findUnique({
      where: { leakId_userId: { leakId, userId } }
    });

    if (existing) {
      // Remove upvote
      await prisma.leakUpvote.delete({
        where: { id: existing.id }
      });
      return { msg: 'Upvote removed', upvoted: false };
    } else {
      // Add upvote
      await prisma.leakUpvote.create({
        data: { leakId, userId }
      });
      
      // Give points to reporter
      const leak = await prisma.leak.findUnique({ where: { id: leakId } });
      if (leak) {
        await prisma.user.update({
          where: { id: leak.reporterId },
          data: { points: { increment: 2 } } // 2 points for a helpful leak
        });
      }

      return { msg: 'Upvote added', upvoted: true };
    }
  }
}
