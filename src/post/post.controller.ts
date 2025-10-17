import { Controller, Post, Body, Get, Param, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from 'src/user/jwt strategy/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postService.create(createPostDto, userId);
  }

  @Get()
  async findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postService.update(id, updatePostDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.postService.delete(id, userId);
  }
}

