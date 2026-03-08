import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'pem_secure_secret_123';

export class UserService {
  private userRepository = new UserRepository();

  async register(data: Omit<User, 'id'>) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({ ...data, password: hashedPassword });
  }

  async login(email: string, pass: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }
}
