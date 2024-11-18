import { Request, Response } from 'express';
import { VerifyService } from '../services/verify.service';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
  };
}

export class VerifyController {
  private verifyService: VerifyService;

  constructor() {
    this.verifyService = new VerifyService();
  }

  verifyPerson = async (req: RequestWithUser, res: Response) => {
    try {
      const { personId } = req.body;
      const securityId = req.user?.userId;

      const result = await this.verifyService.verifyPersonAtSecurityLocation(
        personId,
        securityId!
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}