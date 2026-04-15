import * as turf from '@turf/turf';
import { PrismaClient, Leak } from '@prisma/client';

const prisma = new PrismaClient();
const CLUSTER_RADIUS_METERS = 100; // 100 meters radius for clustering
const CRITICAL_FLOW_MULTIPLIER = 2.0;

export class ClusteringService {
  /**
   * Find a nearby cluster for a leak, or create a new one
   */
  static async assignToCluster(leak: Leak): Promise<string> {
    try {
      // 1. Find all active clusters
      const activeClusters = await prisma.cluster.findMany({
        where: {
          status: { in: ['REPORTED', 'VERIFIED', 'IN_PROGRESS'] }
        }
      });

      // 2. Check distance to each cluster
      const leakPoint = turf.point([leak.longitude, leak.latitude]);
      
      let closestCluster = null;
      let minDistance = CLUSTER_RADIUS_METERS;

      for (const cluster of activeClusters) {
        const clusterCenter = turf.point([cluster.centerLongitude, cluster.centerLatitude]);
        const distance = turf.distance(leakPoint, clusterCenter, { units: 'meters' });

        if (distance <= CLUSTER_RADIUS_METERS && distance < minDistance) {
          minDistance = distance;
          closestCluster = cluster;
        }
      }

      // 3. If nearby cluster found, assign leak and update cluster
      if (closestCluster) {
        await this.updateCluster(closestCluster.id, leak);
        return closestCluster.id;
      }

      // 4. If no nearby cluster, create new one
      const newCluster = await prisma.cluster.create({
        data: {
          centerLatitude: leak.latitude,
          centerLongitude: leak.longitude,
          radius: CLUSTER_RADIUS_METERS,
          totalReports: 1,
          priorityScore: leak.priorityScore,
          status: leak.status
        }
      });

      return newCluster.id;
    } catch (error) {
      console.error('Clustering failed:', error);
      throw error;
    }
  }

  /**
   * Update cluster metrics when new leak added
   */
  private static async updateCluster(clusterId: string, newLeak: Leak) {
    const cluster = await prisma.cluster.findUnique({
      where: { id: clusterId },
      include: { leaks: true }
    });

    if (!cluster) return;

    // Recalculate center (average of all leaks)
    const allLeaks = [...cluster.leaks, newLeak];
    const avgLat = allLeaks.reduce((sum, l) => sum + l.latitude, 0) / allLeaks.length;
    const avgLng = allLeaks.reduce((sum, l) => sum + l.longitude, 0) / allLeaks.length;

    // Recalculate priority score mathematically
    const combinedScore = allLeaks.reduce((sum, l) => sum + l.priorityScore, 0);
    // Huge multiplier if multiple severe leaks in same spot
    const urgencyMultiplier = allLeaks.filter(l => l.severity === 'SEVERE' || l.severity === 'CRITICAL').length > 1 ? 1.5 : 1.0;
    
    const newPriorityScore = Math.min(100, Math.round(combinedScore * urgencyMultiplier));

    // Update DB
    await prisma.cluster.update({
      where: { id: clusterId },
      data: {
        centerLatitude: avgLat,
        centerLongitude: avgLng,
        totalReports: allLeaks.length,
        priorityScore: newPriorityScore,
        // Upgrade cluster status if leak is verified
        status: newLeak.status === 'VERIFIED' ? 'VERIFIED' : cluster.status
      }
    });

    // Alert authorities if cluster becomes critical
    if (newPriorityScore >= 80) {
      this.alertAuthorities(clusterId);
    }
  }

  /**
   * Simplified Water Loss calculation based on flow rate and pressure
   */
  static calculateWaterLoss(flowRate: string, durationHours: number = 24): number {
    // Base liters per hour estimations
    const rates: Record<string, number> = {
      'DRIP': 2,        // 2 liters/hour (leaky tap)
      'STREAM': 30,     // 30 liters/hour (moderate pipe leak)
      'GUSH': 500,      // 500 liters/hour (major pipe burst)
      'FLOOD': 2000     // 2000 liters/hour (main line break)
    };

    const rate = rates[flowRate] || 30;
    return rate * durationHours;
  }

  /**
   * Calculate leak priority score (0-100)
   */
  static calculatePriority(severity: string, flowRate: string, trustScore: number): number {
    let score = 0;

    // Severity weights (max 40)
    const severityValues: Record<string, number> = {
        'MINOR': 10, 'MODERATE': 20, 'SEVERE': 30, 'CRITICAL': 40
    };
    score += severityValues[severity] || 10;

    // Flow Rate weights (max 40)
    const flowValues: Record<string, number> = {
        'DRIP': 5, 'STREAM': 15, 'GUSH': 30, 'FLOOD': 40
    };
    score += flowValues[flowRate] || 10;

    // User Trust weight (max 20)
    // A highly trusted user reporting a leak boosts its priority
    score += (trustScore / 100) * 20;

    return Math.min(100, Math.round(score));
  }

  private static alertAuthorities(clusterId: string) {
    console.log(`🚨 CRITICAL CLUSTER ALERT: ${clusterId}. Needs immediate crew dispatch.`);
    // Real app: Send SMS/Email/Push notification to admin
  }
}
