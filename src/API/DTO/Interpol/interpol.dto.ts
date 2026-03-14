import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class InterpolSearchRequestDto {
   @IsOptional()
   @IsString()
   name?: string;

   @IsOptional()
   @IsString()
   forename?: string;

   @IsOptional()
   @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
   @IsInt()
   @Min(0)
   ageMin?: number;

   @IsOptional()
   @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
   @IsInt()
   @Min(0)
   ageMax?: number;

   @IsOptional()
   @IsString()
   dateOfBirth?: string;

   @IsOptional()
   @IsString()
   identity?: string;

   @IsOptional()
   @IsString()
   entityId?: string;

   @IsOptional()
   @IsString()
   dob?: string;

   @IsOptional()
   @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
   @IsInt()
   @Min(1)
   @Max(100)
   nb?: number;

   @IsOptional()
   @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
   @IsInt()
   @Min(1)
   @Max(100)
   nbRecord?: number;
}

export class InterpolDetailsQueryDto {
   @IsString()
   @IsNotEmpty()
   item_id!: string;
}

export class InterpolDownloadNoticeQueryDto {
   @IsString()
   @IsNotEmpty()
   path!: string;
}

export class InterpolDownloadImageQueryDto {
   @IsString()
   @IsNotEmpty()
   item_id!: string;

   @IsString()
   @IsNotEmpty()
   path!: string;
}

export class InterpolSltdSearchRequestDto {
   @IsString()
   @IsNotEmpty()
   din!: string;

   @IsString()
   @IsNotEmpty()
   countryOfRegistration!: string;

   @IsString()
   @IsNotEmpty()
   typeOfDocument!: string;

   @IsOptional()
   @IsInt()
   @Min(1)
   @Max(100)
   nb?: number;
}

export class InterpolSltdDetailsRequestDto {
   @IsString()
   @IsNotEmpty()
   id!: string;
}
