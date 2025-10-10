import { Injectable, NotFoundException,BadRequestException,ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  updateProfile: any;
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  // used by JwtStrategy
  async findById(id: string): Promise<UserDocument | null> {
    // select '-password' for safety
    return this.userModel.findById(id).select('-password');
  }

  async updateUser(userId: string | Types.ObjectId, dto: UpdateUserDto) {
    const update: Partial<User> = {};

    if (dto.fullName !== undefined) update.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) update.phoneNumber = dto.phoneNumber;

    if (Object.keys(update).length === 0) {
      throw new BadRequestException('No profile fields provided to update');
    }

    // Ensure phone number uniqueness
    if (update.phoneNumber) {
      const existing = await this.userModel
        .findOne({ phoneNumber: update.phoneNumber, _id: { $ne: userId } })
        .lean();

      if (existing) {
        throw new ConflictException('Phone number is already in use');
      }
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true })
      .select('-password');

    if (!updated) throw new NotFoundException('User not found');

    return updated;
  }
}