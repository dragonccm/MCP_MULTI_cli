import { Request, Response } from 'express';
import { UserService } from '../services';

export class AuthController {
  private userService = new UserService();

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password and name are required' });
        return;
      }
      
      const user = await this.userService.register(req.body);
      res.status(201).json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(401).json({ message });
    }
  };
}
