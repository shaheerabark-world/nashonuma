import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export type PublicUser = Omit<User, 'passwordHash' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  /** Includes the password hash, for checking a login. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('LOWER(u.email) = LOWER(:email)', { email: email.trim() })
      .getOne();
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return UsersService.toPublic(user);
  }

  static toPublic(u: User): PublicUser {
    return { id: u.id, email: u.email, name: u.name, initials: u.initials, job: u.job, role: u.role, phone: u.phone };
  }
}
