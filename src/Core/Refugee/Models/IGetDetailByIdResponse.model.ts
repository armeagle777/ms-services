import { RefugeeCardModel } from 'src/Core/RefugeeCard/Models';
import { IRefugeeDetail } from './IRefugeeDetail.model';
import { IRefugeeFamilyMemberModel } from './IRefugeeFamilyMember.model';

export interface IGetDetailByIdResponseModel extends IRefugeeDetail {
   cards: RefugeeCardModel[];
   familyMembers: IRefugeeFamilyMemberModel[];
}
