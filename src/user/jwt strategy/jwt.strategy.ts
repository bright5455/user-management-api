// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { UserService } from 'src/user/user.service';
// import { User } from 'src/user/schemas/user.schemas';
// import { UnauthorizedException } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//     constructor( private userService: UserService,
//         private configService: ConfigService,

//     ) {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: configService.getOrThrow('JWT_SECRET'),
//         });
//     }
//     async validate(payload: {sub: string; email: string}) {
//         const user = await this.userService.findById(payload.sub);
//         if (!user) {
//             throw new UnauthorizedException('user not found');
//         }
//         return { userId: user.id, email: user.email};
//     }
//     }
    
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  // Payload type: sub should be a string (user id)
  async validate(payload: { sub: string; email: string }) {
    // Helpful debug log while developing
    console.log('JwtStrategy.validate payload:', payload);

    // Ensure payload.sub is a string
    const userId = String(payload.sub);

    const user = await this.userService.findById(userId);
    if (!user) {
      // more explicit message for debugging
      throw new UnauthorizedException('User not found (from JwtStrategy.validate)');
    }

    // Type assertion to inform TypeScript about user shape
    const typedUser = user as { _id: { toString(): string }, email: string, fullName?: string };

    // Attach the userId and email to req.user
    // return { userId: user.id.toString(), email: user.email };
     return {
      userId: typedUser._id.toString(), // <-- ensure _id exists before converting
      email: typedUser.email,
      fullName: typedUser.fullName,
    };
  }
}
