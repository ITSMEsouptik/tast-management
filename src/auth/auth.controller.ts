import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { JwTResponse } from './jwt-payload.interface';
import { SignInAuthCredentialsDTO } from './dto/signIn-auth-credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    @Post('/signup')
    async signUp(@Body() authCredentialsDTO: AuthCredentialsDTO){
        await this.authService.signUp(authCredentialsDTO);
    }

    @Post('/signin')
    async signIn(@Body() authCredentialsDTO: SignInAuthCredentialsDTO): Promise<JwTResponse>{
        return await this.authService.signIn(authCredentialsDTO);
    }
}
