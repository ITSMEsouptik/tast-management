import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwTPayload } from './jwt-payload.interface';

@Injectable()
export class JwTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: 'topSecret51',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwTPayload): Promise<User>{
    const {username} = payload;
    const user = await this.userRepository.findOne({
        where: {
            username
        }
    })
    if(!user){
        throw new UnauthorizedException();
    }
    return user;
  }
}
