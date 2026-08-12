import { XMLParser } from 'fast-xml-parser';

import {
   WISDM_FUNCTIONAL_ERRORS,
   WisdmFunctionalErrorKey,
} from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import {
   SOAP_ENVELOPE_NAMESPACE,
   XSD_NAMESPACE,
   XSI_NAMESPACE,
} from 'src/Infrustructure/Services/WisdmIntegration/Constants/wisdm.constants';

/**
 * SOAP/XML plumbing for the WISDM integration. Kept separate from
 * `Wisdm.integration.ts` so the integration reads as a list of operations rather than a
 * wall of string manipulation, and so these functions stay unit-testable in isolation.
 */

const xmlParser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

/** Escapes the five XML predefined entities. */
export const xmlEscape = (value: unknown): string => {
   if (value === null || value === undefined) return '';
   return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
};

export const decodeXmlEntities = (value: string): string =>
   value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');

/**
 * Builds `<prefix:Name>value</prefix:Name>`. `undefined`/`null` omit the field, while an
 * explicit empty string emits an empty element so update requests can clear optional data.
 */
export const buildElement = (
   prefix: string,
   name: string,
   value: string | number | undefined | null,
): string => {
   if (value === undefined || value === null) return '';
   return `<${prefix}:${name}>${xmlEscape(value)}</${prefix}:${name}>`;
};

/** Joins non-empty elements produced by {@link buildElement}. */
export const buildElements = (elements: string[]): string => elements.filter(Boolean).join('');

type EnvelopeParams = {
   prefix: string;
   namespace: string;
   bodyXml: string;
   userInfoUsername: string;
   referenceInCountry: string;
   username: string;
   password: string;
   usernameTokenVersion: string;
};

type InfosEnvelopeParams = Pick<
   EnvelopeParams,
   'prefix' | 'namespace' | 'bodyXml' | 'username' | 'password' | 'usernameTokenVersion'
>;

/**
 * Builds the WISDM SOAP envelope. Authentication is header-based login/password, the same
 * principle as the FIND method already used by the Interpol integration (§2.2).
 */
export const buildWisdmEnvelope = ({
   prefix,
   namespace,
   bodyXml,
   userInfoUsername,
   referenceInCountry,
   username,
   password,
   usernameTokenVersion,
}: EnvelopeParams): string => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_ENVELOPE_NAMESPACE}"
               xmlns:xsi="${XSI_NAMESPACE}"
               xmlns:xsd="${XSD_NAMESPACE}"
               xmlns:${prefix}="${namespace}">
    <soap:Header>
        <${prefix}:UserInformation>
            <${prefix}:Username>${xmlEscape(userInfoUsername)}</${prefix}:Username>
            <${prefix}:ReferenceInCountry>${xmlEscape(referenceInCountry)}</${prefix}:ReferenceInCountry>
        </${prefix}:UserInformation>

        <${prefix}:UsernameToken Version="${xmlEscape(usernameTokenVersion)}">
            <${prefix}:Username>${xmlEscape(username)}</${prefix}:Username>
            <${prefix}:Password>${xmlEscape(password)}</${prefix}:Password>
        </${prefix}:UsernameToken>
    </soap:Header>

    <soap:Body>
${bodyXml}
    </soap:Body>
</soap:Envelope>
`;

/**
 * Builds the header published by the supplied `infos.asmx?WSDL`. Unlike the unverified
 * SLTD service contract, Infos declares only `UsernameToken`; sending `UserInformation`
 * here would add an element that is not part of its binding.
 */
export const buildWisdmInfosEnvelope = ({
   prefix,
   namespace,
   bodyXml,
   username,
   password,
   usernameTokenVersion,
}: InfosEnvelopeParams): string => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_ENVELOPE_NAMESPACE}"
               xmlns:xsi="${XSI_NAMESPACE}"
               xmlns:xsd="${XSD_NAMESPACE}"
               xmlns:${prefix}="${namespace}">
    <soap:Header>
        <${prefix}:UsernameToken Version="${xmlEscape(usernameTokenVersion)}">
            <${prefix}:Username>${xmlEscape(username)}</${prefix}:Username>
            <${prefix}:Password>${xmlEscape(password)}</${prefix}:Password>
        </${prefix}:UsernameToken>
    </soap:Header>

    <soap:Body>
${bodyXml}
    </soap:Body>
</soap:Envelope>
`;

/** Extracts `<faultstring>` from a SOAP fault, if any. */
export const extractSoapFault = (xml: string): string | null => {
   const match = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/i);
   return match ? match[1].trim() : null;
};

/** First text value of a tag, namespace prefix agnostic. */
export const firstTagValue = (xml: string, tagName: string): string | null => {
   const pattern = new RegExp(`<(?:\\w+:)?${tagName}[^>]*>([^<]*)<\\/(?:\\w+:)?${tagName}>`, 'i');
   const match = xml.match(pattern);
   const value = match ? match[1].trim() : '';
   return value === '' ? null : value;
};

/** All text values of a repeated tag, namespace prefix agnostic. */
export const allTagValues = (xml: string, tagName: string): string[] => {
   const pattern = new RegExp(`<(?:\\w+:)?${tagName}[^>]*>([^<]*)<\\/(?:\\w+:)?${tagName}>`, 'gi');
   const values: string[] = [];
   let match: RegExpExecArray | null;

   while ((match = pattern.exec(xml)) !== null) {
      values.push(match[1].trim());
   }

   return values;
};

/** Every `<tagName>…</tagName>` block, used to iterate repeated complex nodes. */
export const allTagBlocks = (xml: string, tagName: string): string[] => {
   const pattern = new RegExp(
      `<(?:\\w+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`,
      'gi',
   );
   const blocks: string[] = [];
   let match: RegExpExecArray | null;

   while ((match = pattern.exec(xml)) !== null) {
      blocks.push(match[1]);
   }

   return blocks;
};

/** Inner XML/text of the first matching element, including nested markup. */
export const firstTagInner = (xml: string, tagName: string): string | null => {
   const pattern = new RegExp(
      `<(?:\\w+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`,
      'i',
   );
   const match = xml.match(pattern);
   const value = match ? match[1].trim() : '';
   return value === '' ? null : value;
};

/** Inner content of `<xmlData>`, which WISDM uses to wrap payloads (often escaped). */
export const extractXmlDataInner = (responseXml: string): string => {
   const match = responseXml.match(/<(?:\w+:)?xmlData[^>]*>([\s\S]*?)<\/(?:\w+:)?xmlData>/i);
   return match ? match[1].trim() : '';
};

/** Parses the `<xmlData>` payload into a plain object, unescaping it first when needed. */
export const parseXmlDataToJson = (responseXml: string): Record<string, unknown> | null => {
   const xmlData = extractXmlDataInner(responseXml);
   if (!xmlData) return null;

   const looksEscapedXml = /&lt;[A-Za-z_]/.test(xmlData);
   const normalized = looksEscapedXml ? decodeXmlEntities(xmlData) : xmlData;

   try {
      return xmlParser.parse(normalized) as Record<string, unknown>;
   } catch {
      return null;
   }
};

/** Returns the `<xmlData>` payload as raw XML, unescaped — handy for regex extraction. */
export const extractXmlDataRaw = (responseXml: string): string => {
   const xmlData = extractXmlDataInner(responseXml);
   if (!xmlData) return '';
   return /&lt;[A-Za-z_]/.test(xmlData) ? decodeXmlEntities(xmlData) : xmlData;
};

/** Parses a numeric value, returning `null` rather than `NaN`. */
export const toNumberOrNull = (value: string | null | undefined): number | null => {
   if (value === null || value === undefined || value.trim() === '') return null;
   const parsed = Number(value);
   return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Maps an upstream error string onto the documented functional error catalogue (§3.1.1).
 * WISDM returns the reason as free text / an `resultOtherCode`, so matching is keyword
 * based; unmatched errors simply yield `null` and the raw fields are passed through.
 */
const FUNCTIONAL_ERROR_MATCHERS: Array<{ key: WisdmFunctionalErrorKey; pattern: RegExp }> = [
   { key: 'DIN_ALREADY_PRESENT', pattern: /already\s+(present|exists|in\s+the\s+database)/i },
   { key: 'DIN_FORMAT_INVALID', pattern: /din.*(format|invalid|length)|invalid.*din/i },
   { key: 'DOCUMENT_TYPE_INVALID', pattern: /type\s+of\s+document.*(incorrect|invalid|authoriz)/i },
   { key: 'FRAUD_TYPE_INVALID', pattern: /type\s+of\s+fraud.*(incorrect|invalid|authoriz)/i },
   { key: 'COUNTRY_OF_THEFT_MISSING', pattern: /country\s+of\s+theft.*(missing|empty|required)/i },
   { key: 'COUNTRY_OF_THEFT_INVALID', pattern: /country\s+of\s+theft.*(incorrect|invalid)/i },
   {
      key: 'STOLEN_BATCH_IDENTIFIER_NOT_ALLOWED',
      pattern: /stolen\s+batch.*(only|not\s+allowed|blank)/i,
   },
   { key: 'DATE_OF_THEFT_NOT_IN_PAST', pattern: /date\s+of\s+theft.*(past|future)/i },
   { key: 'ISSUANCE_DATE_NOT_IN_PAST', pattern: /issuance\s+date.*(past|future)/i },
   { key: 'RETENTION_DATE_EXCEEDS_PERIOD', pattern: /retention.*(exceed|higher|greater)/i },
   { key: 'RETENTION_DATE_NOT_IN_FUTURE', pattern: /retention.*(future|past)/i },
   { key: 'EXTENSION_REASON_INVALID', pattern: /extension.*(incorrect|invalid|authoriz)/i },
   { key: 'DATE_FORMAT_INVALID', pattern: /date.*(format).*(incorrect|invalid)/i },
   { key: 'FIELD_TOO_LONG', pattern: /(longer\s+than|too\s+(long|high)|exceeds?\s+.*characters)/i },
   { key: 'RECORD_NOT_FOUND', pattern: /(not\s+present|not\s+found|could\s+not\s+be\s+found)/i },
];

export const matchFunctionalError = (
   ...candidates: Array<string | null | undefined>
): { key: WisdmFunctionalErrorKey; message: string } | null => {
   const haystack = candidates.filter(Boolean).join(' | ');
   if (!haystack) return null;

   const matched = FUNCTIONAL_ERROR_MATCHERS.find(({ pattern }) => pattern.test(haystack));
   if (!matched) return null;

   return {
      key: matched.key,
      message: WISDM_FUNCTIONAL_ERRORS[matched.key].message,
   };
};
