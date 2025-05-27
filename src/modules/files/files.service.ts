import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BufferedFile } from './interfaces';
import { extname, join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { objectId } from '@utils';

@Injectable()
export class FilesService {
  private readonly uploadPath = join(process.cwd(), 'public/uploads');

  constructor(private readonly prisma: PrismaService) {
    this.ensureDirectoryExists(this.uploadPath);
  }

  async upload(file: BufferedFile, user: IUserSession) {
    const mimeType = file.mimetype;
    const fileName: string = file.originalname;
    const fileBuffer = file.buffer;

    if (fileBuffer?.length / 1_000_000 > 40) {
      throw new ForbiddenException('More than 40 mb file upload is forbidden.');
    }
    const id = objectId();
    const filePath = join(this.uploadPath, `${id}${extname(fileName.toLocaleLowerCase())}`);

    const savedFile = await this.prisma.files.create({
      data: {
        id,
        bucketName: 'local', // optional, you may remove or rename this field
        createdById: user.id,
        type: mimeType,
        name: fileName.slice(0, 255),
        size: fileBuffer.length,
        path: filePath,
      },
    });

    await fsp.writeFile(filePath, fileBuffer);

    return {
      ...savedFile,
      created_at: new Date(),
    };
  }

  async download(fileId: string, user: IUserSession, response: Response) {
    const file = await this.prisma.files.findUnique({
      where: { id: fileId, isDeleted: false },
    });

    if (!file) {
      throw new NotFoundException(null, 'FileNotFound');
    }

    const filePath = join(this.uploadPath, `${file.id}${extname(file.name)}`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    await this.prisma.downloadHistory.create({
      data: {
        id: objectId(),
        fileId: file.id,
        userId: user.id,
      },
    });

    response.status(200);
    response
      .header('Accept-Ranges', 'bytes')
      .header('Content-Type', file.type)
      .header('Content-Length', `${file.size}`)
      .header(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      );

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(response);
  }

  async downloadBuffer(fileId: string): Promise<Buffer> {
    const file = await this.prisma.files.findUnique({
      where: { id: fileId, isDeleted: false },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(this.uploadPath, `${file.id}${extname(file.name)}`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return await fsp.readFile(filePath);
  }

  private ensureDirectoryExists(directory: string) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Directory '${directory}' created.`);
    } else {
      console.log(`Directory '${directory}' already exists.`);
    }
  }
}
