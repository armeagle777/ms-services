import {
   // Body,
   Controller,
   Get,
   Post,
} from '@nestjs/common';

import { SphereService } from 'src/Core/Sphere/Sphere.service';
// import { SphereUploadRequestDto } from 'src/API/DTO/Sphere/sphere.dto';

@Controller('sphere')
export class SphereController {
   constructor(private readonly sphereService: SphereService) {}

   @Post('upload')
   uploadExcel() {
      // @Body() body: SphereUploadRequestDto
      return this.sphereService
         .uploadExcel
         // body
         ();
   }

   @Get()
   getAllSpheres() {
      return this.sphereService.getAllSpheres();
   }
}
