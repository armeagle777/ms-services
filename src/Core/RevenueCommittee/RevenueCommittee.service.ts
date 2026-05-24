import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';

import { CompanyObligationsQueryDto } from 'src/API/DTO/Tax/tax.dto';
import {
   EmployerInfoItem,
   EmploymentContractResponse,
   FilteredEmployerInfoItem,
   GetTaxInfoResponse,
   PositionInfoItem,
   TaxInfoResponseBody,
   TaxSsnResponse,
   TaxObligationsResponse,
   TaxPersonObligationsResponse,
} from './RevenueCommittee.types';
import { RevenueCommitteeIntegration } from 'src/Infrustructure/Services/RevenueCommitteeIntegration/RevenueCommittee.integration';
import { EmploymentContractsIntegration } from 'src/Infrustructure/Services/RevenueCommitteeEmploymentIntegration/RevenueCommitteeEmployment.integration';

@Injectable()
export class RevenueCommitteeService {
   private readonly xmlParser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
   });

   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
      private readonly revenueCommittee: RevenueCommitteeIntegration,
      private readonly employeeContractsClient: EmploymentContractsIntegration,
   ) {}

   async getCompanyObligations(
      tin: string,
      query: CompanyObligationsQueryDto,
   ): Promise<TaxObligationsResponse | null> {
      const startDate = query?.startDate || '1970-01-01';
      const endDate = query?.endDate || this.getEkengRequestsEndDate();

      const ekengRequestProps = { tin, startDate, endDate };

      const options = this.revenueCommittee.buildRequestOptions(
         '/tin_info_obligation/v1',
         ekengRequestProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      const data = response.data;

      return data?.ssn_obligations_response?.responseStatus?.statusCode === 1
         ? (data.ssn_obligations_response as TaxObligationsResponse)
         : null;
   }

   async getPersonObligations(ssn: string): Promise<TaxPersonObligationsResponse> {
      const url = this.configService.get<string>('REVENUE_COMMITTEE_PERSONS_API_URL');
      if (!url)
         throw new InternalServerErrorException(
            'REVENUE_COMMITTEE_PERSONS_API_URL is not configured',
         );

      const xmlData = this.formatObligationsXmlData(ssn);

      const response = await firstValueFrom(
         this.httpService.post(url, xmlData, {
            headers: { 'Content-Type': 'text/xml' },
            timeout: 10000,
         }),
      );
      const jsonObj = this.xmlParser.parse(response.data);
      const responseBody = jsonObj?.Envelope?.Body?.Response?.ResponseBody || {};

      return responseBody as TaxPersonObligationsResponse;
   }

   async getEmploymentContracts(ssn: string): Promise<EmploymentContractResponse> {
      const ekengRequestProps = { employee_ssn: ssn };
      const options = this.employeeContractsClient.buildRequestOptions(
         '/employment_contract/v1',
         ekengRequestProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      const data = response.data;
      return data;
   }

   async getSsnTaxInfo(body: {
      ssn?: string;
      start_date?: string;
      end_date?: string;
   }): Promise<TaxSsnResponse> {
      const ekengRequestProps = {
         ...body,
         start_date: body.start_date || '1970-01-01',
      };
      const options = this.employeeContractsClient.buildRequestOptions(
         '/ssn/v1',
         ekengRequestProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      return response.data;
   }

   async getTaxInfo(body: {
      ssn: string;
      start_date?: string;
      end_date?: string;
   }): Promise<GetTaxInfoResponse> {
      const ekengRequestProps = {
         ...body,
         start_date: body.start_date || '01.01.1991',
         end_date: body.end_date || this.getCurrentDateDdMmYyyy(),
      };
      const options = this.employeeContractsClient.buildRequestOptions(
         '/get_tax_info/v1',
         ekengRequestProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      return this.filterActualTaxInfo(response.data);
   }

   private filterActualTaxInfo(data: GetTaxInfoResponse): GetTaxInfoResponse {
      if (data?.get_tax_info_response) {
         return {
            ...data,
            get_tax_info_response: this.filterActualTaxInfoBody(data.get_tax_info_response),
         };
      }

      return this.filterActualTaxInfoBody(data as TaxInfoResponseBody);
   }

   private filterActualTaxInfoBody(data: TaxInfoResponseBody): TaxInfoResponseBody {
      return {
         ...data,
         EmployerInfo: this.filterActualEmployerInfo(data?.EmployerInfo as EmployerInfoItem[]),
      };
   }

   private filterActualEmployerInfo(employerInfo?: EmployerInfoItem[]): FilteredEmployerInfoItem[] {
      if (!Array.isArray(employerInfo)) return [];

      return employerInfo
         .map((employerInfoItem) => {
            const employer = {
               ...employerInfoItem,
               PositionInfo: this.filterActualPositionInfo(employerInfoItem.PositionInfo),
            };

            delete employer.Salary;
            delete employer.Benefit;
            delete employer.Net_income;
            delete employer.Contract_revenue;

            return employer;
         })
         .filter((employer) => employer.PositionInfo.length > 0);
   }

   private filterActualPositionInfo(positionInfo?: PositionInfoItem[]): PositionInfoItem[] {
      if (!Array.isArray(positionInfo)) return [];

      return positionInfo.filter(
         (position) => !!position.Position_Start_Date && !position.Position_End_Date,
      );
   }

   private formatObligationsXmlData(ssn: string) {
      return `
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns="http://www.taxservice.am/tp3/police/definitions">
          <s:Header/>
          <s:Body>
            <Request>
              <GetTaxpayerDepts>
                <PSN>${ssn}</PSN>
              </GetTaxpayerDepts>
            </Request>
          </s:Body>
        </s:Envelope>
      `;
   }

   private getEkengRequestsEndDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
   }

   private getCurrentDateDdMmYyyy() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();

      return `${day}.${month}.${year}`;
   }
}
