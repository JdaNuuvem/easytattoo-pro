import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function generateFilename(
  _req: any,
  file: Express.Multer.File,
  callback: (err: Error | null, filename: string) => void,
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname);
  callback(null, `${uniqueSuffix}${ext}`);
}

function createMulterOptions(subdirectory: string) {
  return {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const dest = `${uploadDir}/${subdirectory}`;
        // Ensure directory exists
        const { mkdirSync, existsSync } = require('fs');
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
      },
      filename: generateFilename,
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (
      _req: any,
      file: Express.Multer.File,
      cb: (err: Error | null, accept: boolean) => void,
    ) => {
      const allowed = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}`), false);
      }
    },
  };
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', createMulterOptions('images')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image' })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file);
    return {
      url: this.uploadService.getFileUrl('images', file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('reference')
  @UseInterceptors(
    FileInterceptor('file', createMulterOptions('references')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a reference image (public, for booking flow)',
  })
  @ApiResponse({ status: 201, description: 'Reference image uploaded' })
  async uploadReference(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file);
    return {
      url: this.uploadService.getFileUrl('references', file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('payment-proof')
  @UseInterceptors(
    FileInterceptor('file', createMulterOptions('payment-proofs')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload a payment proof (public, for booking confirmation)',
  })
  @ApiResponse({ status: 201, description: 'Payment proof uploaded' })
  async uploadPaymentProof(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file);
    return {
      url: this.uploadService.getFileUrl('payment-proofs', file.filename),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
