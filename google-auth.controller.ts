import {
  Controller,
  Get,
  Req,
  Res,
  Injectable,
  Module,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Request, Response } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/api/auth/google/callback',

      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value;

    return {
      googleId: profile.id,
      email: email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      picture: profile.photos?.[0]?.value,
    };
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(user: any) {
    const payload = {
      sub: user.googleId,
      email: user.email,
      provider: 'google',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }
}


@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Passport automatically redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user;

    const result =
      await this.authService.googleLogin(user);

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/success?accessToken=${result.accessToken}`,
    );
  }
}


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    GoogleStrategy,
  ],
})
export class AuthModule {}