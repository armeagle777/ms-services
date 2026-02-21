import { Body, Controller, Get, Post } from '@nestjs/common';

import { SphereService } from './sphere.service';
import { SphereUploadRequestDto } from './dto/sphere.dto';

@Controller('api/sphere')
export class SphereController {
  constructor(private readonly sphereService: SphereService) {}

  @Post('upload')
  uploadExcel(@Body() body: SphereUploadRequestDto) {
    return this.sphereService.uploadExcel(body);
  }

  @Get()
  getAllSpheres() {
    return this.sphereService.getAllSpheres();
  }
}
