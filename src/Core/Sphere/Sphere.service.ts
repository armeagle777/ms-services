import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { Model, ModelStatic } from 'sequelize';

import { SPHERE_MODEL } from 'src/Core/Sphere/sphere.tokens';
import { SphereRecord } from 'src/Core/Sphere/interfaces/sphere.interfaces';
import { SphereUploadRequestDto } from 'src/API/DTO/Sphere/sphere.dto';

@Injectable()
export class SphereService {
  constructor(
    @Inject(SPHERE_MODEL) private readonly sphereModel: ModelStatic<Model<any, any>>,
  ) {}

  async uploadExcel(_body: SphereUploadRequestDto) {
    throw new NotImplementedException('File upload logic is not migrated.');
  }

  async getAllSpheres(): Promise<SphereRecord[]> {
    const data = await this.sphereModel.findAll({
      order: [['id', 'DESC']],
    });

    return data as unknown as SphereRecord[];
  }
}
