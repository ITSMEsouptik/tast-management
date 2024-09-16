import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { JwTPayload, JwTResponse } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    const { username, password } = authCredentialsDTO;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const task: User = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    try {
      await this.userRepository.save(task);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User Already Exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDTO: AuthCredentialsDTO): Promise<JwTResponse> {
    const { username, password } = authCredentialsDTO;
    const user = await this.userRepository.findOne({
        where: {
            username
        }
    })
    if(user && (await bcrypt.compare(password, user.password))) {
        const payload: JwTPayload = {username}
        const accessToken: string = this.jwtService.sign(payload)
        return {accessToken}
    }
    else {
        throw new UnauthorizedException('Please Check your login credentials');
    }
  }
}
