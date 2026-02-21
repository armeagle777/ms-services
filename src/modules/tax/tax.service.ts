import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';

import { CompanyObligationsQueryDto } from './dto/tax.dto';
import {
  TaxObligationsResponse,
  TaxPersonObligationsResponse,
} from './interfaces/tax.interfaces';
import { EkengIntegration } from '../shared/ekeng.integration';

@Injectable()
export class TaxService {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly ekeng: EkengIntegration,
  ) {}

  async getCompanyObligations(
    tin: string,
    query: CompanyObligationsQueryDto,
  ): Promise<TaxObligationsResponse | null> {
    const apiUrl = this.configService.get<string>('TAX_API_URL');
    if (!apiUrl) throw new InternalServerErrorException('TAX_API_URL is not configured');

    const startDate = query?.startDate || '1970-01-01';
    const endDate = query?.endDate || this.getEkengRequestsEndDate();

    const ekengRequestProps = { tin, startDate, endDate };

    const options = this.ekeng.buildRequestOptions(
      `${apiUrl}/tin_info_obligation/v1`,
      ekengRequestProps,
    );

    const response = await firstValueFrom(this.httpService.request(options));
    const data = response.data;

    return data?.ssn_obligations_response?.responseStatus?.statusCode === 1
      ? (data.ssn_obligations_response as TaxObligationsResponse)
      : null;
  }

  async getPersonObligations(ssn: string): Promise<TaxPersonObligationsResponse> {
    const url = this.configService.get<string>('TAX_PERSON_OBLIGATIONS_URL');
    if (!url)
      throw new InternalServerErrorException('TAX_PERSON_OBLIGATIONS_URL is not configured');

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
}
