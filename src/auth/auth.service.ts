import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/schemas/user.schemas';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { fullName, email, password, phoneNumber } = registerDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // ensure sub is a string
    const payload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    // delegate to UserService which performs DB update
    const updatedUser = await this.userService.updateUser(userId, dto);
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return updatedUser;
  }
}
