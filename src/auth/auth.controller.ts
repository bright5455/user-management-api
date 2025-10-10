import { Controller, Post, Body, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/user/jwt strategy/jwt-auth.guard'; // ensure path is correct
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    // req.user.userId is set by JwtStrategy.validate
    const userId = req.user?.userId;
    const user = await this.authService.getProfile(userId);
    return {
      message: 'User profile fetched successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    // small debug log:
    console.log('AuthController.updateProfile - req.user:', req.user);

    const userId = req.user?.userId;
    const updatedUser = await this.authService.updateProfile(userId, dto);
    return {
      message: 'User profile updated successfully',
      user: updatedUser,
    };
  }
}
