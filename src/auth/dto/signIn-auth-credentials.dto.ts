import { IsString } from 'class-validator';

export class SignInAuthCredentialsDTO {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
