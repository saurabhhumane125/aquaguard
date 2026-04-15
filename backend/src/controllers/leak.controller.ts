import { Request, Response } from 'express';
import { LeakService } from '../services/leak.service';

export class LeakController {
  static async reportLeak(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (!req.file) return res.status(400).json({ error: 'Photo is required' });

      // Note: Data might be a stringified JSON if sent as multipart/form-data
      let data = req.body;
      if (typeof data.location === 'string') {
        data = { ...data, ...JSON.parse(data.location) };
      }

      const leak = await LeakService.reportLeak(data, req.file, req.user.userId);
      res.status(201).json(leak);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getLeaks(req: Request, res: Response) {
    try {
      const leaks = await LeakService.getLeaks(req.query as any);
      res.json(leaks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLeakById(req: Request, res: Response) {
    try {
      const leak = await LeakService.getLeakById(req.params.id);
      if (!leak) return res.status(404).json({ error: 'Leak not found' });
      res.json(leak);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMyLeaks(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const leaks = await LeakService.getMyLeaks(req.user.userId);
      res.json(leaks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async upvoteLeak(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const result = await LeakService.upvoteLeak(req.params.id, req.user.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
