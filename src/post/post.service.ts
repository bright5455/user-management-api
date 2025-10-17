import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/post/schemas/post.schemas';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const post = new this.postModel({
      ...createPostDto,
      author: new Types.ObjectId(userId),
    });
    return post.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate('author', 'fullName email').exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('author', 'fullName email');
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    // Ensure only author can edit
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to edit this post');
    }

    Object.assign(post, updatePostDto);
    return post.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await post.deleteOne();
  }
}

