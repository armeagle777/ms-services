const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
const FIND_ENDPOINT = (process.env.FIND_ENDPOINT || '').trim();
const WS_USERINFO_USERNAME = (process.env.WS_USERINFO_USERNAME || '').trim();
const REFERENCE_IN_COUNTRY = (process.env.REFERENCE_IN_COUNTRY || 'ARM-TEST-001').trim();
const WS_USERNAME_VERSION = (process.env.WS_USERNAME_VERSION || '1.0').trim();
const FIND_USERNAME = (process.env.FIND_USERNAME || '').trim();
const FIND_PASSWORD = (process.env.FIND_PASSWORD || '').trim();
const ENQUIRIES_REFERENCE = (process.env.ENQUIRIES_REFERENCE || '').trim();
const DEBUG_SOAP = (process.env.DEBUG_SOAP || '0').trim() === '1';

if (!FIND_ENDPOINT) {
   throw new Error('FIND_ENDPOINT is missing in .env');
}

const SOAP_NS = 'http://schemas.xmlsoap.org/soap/envelope/';
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';
const XSD_NS = 'http://www.w3.org/2001/XMLSchema';
const TNS_NS = 'urn:interpol:ws:find:nominal';

function xmlEscape(value) {
   if (value === null || value === undefined) return '';
   return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
}

function htmlEscape(value) {
   if (value === null || value === undefined) return '';
   return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

function validateDobDdMmYyyy(dob) {
   const value = (dob || '').trim();
   if (!value) return '';

   const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
   if (!match) {
      throw new Error('Date of birth must be dd/mm/yyyy (e.g., 15/03/1971) or empty.');
   }

   const day = Number(match[1]);
   const month = Number(match[2]);
   const year = Number(match[3]);
   const dt = new Date(Date.UTC(year, month - 1, day));

   if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
      throw new Error('Date of birth must be dd/mm/yyyy (e.g., 15/03/1971) or empty.');
   }

   return value;
}

function extractSoapFault(xml) {
   const m = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/i);
   return m ? m[1].trim() : null;
}

function masked(value) {
   if (!value) return '(empty)';
   if (value.length <= 4) return '***';
   return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

function firstTagValue(xml, tagName) {
   const pattern = new RegExp(`<${tagName}>([^<]+)<\\/${tagName}>`, 'i');
   const m = xml.match(pattern);
   return m ? m[1].trim() : null;
}

function buildEnvelope(bodyXml, includeAdminToken) {
   const adminBlock = includeAdminToken
      ? `\n        <tns:AdministrativeToken>\n            <tns:EnquiriesReference>${xmlEscape(ENQUIRIES_REFERENCE)}</tns:EnquiriesReference>\n        </tns:AdministrativeToken>`
      : '';

   return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_NS}"
               xmlns:xsi="${XSI_NS}"
               xmlns:xsd="${XSD_NS}"
               xmlns:tns="${TNS_NS}">
    <soap:Header>
        <tns:UserInformation>
            <tns:Username>${xmlEscape(WS_USERINFO_USERNAME)}</tns:Username>
            <tns:ReferenceInCountry>${xmlEscape(REFERENCE_IN_COUNTRY)}</tns:ReferenceInCountry>
        </tns:UserInformation>

        <tns:UsernameToken Version="${xmlEscape(WS_USERNAME_VERSION)}">
            <tns:Username>${xmlEscape(FIND_USERNAME)}</tns:Username>
            <tns:Password>${xmlEscape(FIND_PASSWORD)}</tns:Password>
        </tns:UsernameToken>${adminBlock}
    </soap:Header>

    <soap:Body>
${bodyXml}
    </soap:Body>
</soap:Envelope>
`;
}

async function soapCall(action, bodyXml, includeAdminToken, timeoutMs = 60000) {
   const envelope = buildEnvelope(bodyXml, includeAdminToken);
   const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      Accept: 'text/xml',
      SOAPAction: `"${TNS_NS}/${action}"`,
   };

   if (DEBUG_SOAP) {
      console.log('\n===== SOAP REQUEST =====');
      console.log('POST', FIND_ENDPOINT);
      console.log('SOAPAction:', headers.SOAPAction);
      console.log(envelope);
      console.log('========================\n');
   }

   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), timeoutMs);

   try {
      const response = await fetch(FIND_ENDPOINT, {
         method: 'POST',
         headers,
         body: envelope,
         signal: controller.signal,
      });
      const text = await response.text();

      if (DEBUG_SOAP) {
         console.log('\n===== SOAP RESPONSE =====');
         console.log('HTTP', response.status);
         console.log(text);
         console.log('=========================\n');
      }

      return { status: response.status, xml: text, requestXml: envelope };
   } catch (err) {
      return {
         status: 599,
         xml: `<faultstring>${xmlEscape(err.message || String(err))}</faultstring>`,
         requestXml: envelope,
      };
   } finally {
      clearTimeout(timeout);
   }
}

function parseBasicFields(responseXml) {
   return {
      resultCode: firstTagValue(responseXml, 'resultCode'),
      resultOtherCode: firstTagValue(responseXml, 'resultOtherCode'),
      requestId: firstTagValue(responseXml, 'requestId'),
   };
}

function extractXmlDataInner(responseXml) {
   const m = responseXml.match(/<xmlData>([\s\S]*?)<\/xmlData>/i);
   return m ? m[1].trim() : '';
}

function parseSearchHits(responseXml) {
   const xmlData = extractXmlDataInner(responseXml);
   if (!xmlData) return [];

   const nominalRegex = /<i:nominal\b[^>]*\bitem_id="([^"]+)"[^>]*>([\s\S]*?)<\/i:nominal>/g;
   const hits = [];
   let match;

   while ((match = nominalRegex.exec(xmlData)) !== null) {
      const itemId = match[1].trim();
      const block = match[2];

      const grab = (tag) => {
         const mm = block.match(new RegExp(`<i:${tag}>([^<]*)<\\/i:${tag}>`));
         return mm ? mm[1].trim() : '';
      };

      const cautionMatch = block.match(/<i:caution_id>([^<]+)<\/i:caution_id>/);
      const scoreMatch = block.match(/<i:query_score>[\s\S]*?<i:value>([^<]+)<\/i:value>/);

      hits.push({
         item_id: itemId,
         name: grab('name'),
         forename: grab('forename'),
         dob: grab('date_of_birth'),
         caution: cautionMatch ? cautionMatch[1].trim() : '',
         score: scoreMatch ? scoreMatch[1].trim() : '',
         owner_office_id: grab('owner_office_id'),
      });
   }

   return hits;
}

function parseDetails(responseXml) {
   const xmlData = extractXmlDataInner(responseXml);
   if (!xmlData) return { fields: {}, refs: [] };

   const nm = xmlData.match(/<i:nominal\b[^>]*\bitem_id="([^"]+)"[^>]*>([\s\S]*?)<\/i:nominal>/);
   if (!nm) return { fields: {}, refs: [] };

   const itemIdShort = nm[1].trim();
   const block = nm[2];

   const grab = (tag) => {
      const mm = block.match(new RegExp(`<i:${tag}>([^<]*)<\\/i:${tag}>`));
      return mm ? mm[1].trim() : '';
   };

   const caution = block.match(/<i:caution_id>([^<]+)<\/i:caution_id>/);

   const fields = {
      item_id_short: itemIdShort,
      name: grab('name'),
      forename: grab('forename'),
      dob: grab('date_of_birth'),
      sex_id: grab('sex_id'),
      owner_office_id: grab('owner_office_id'),
      db_last_updated_on: grab('db_last_updated_on'),
      caution_id: caution ? caution[1].trim() : '',
   };

   const refs = [];
   const fileRegex = /<i:file\b[\s\S]*?<\/i:file>/g;
   let fm;
   while ((fm = fileRegex.exec(block)) !== null) {
      const fileBlock = fm[0];
      const type = fileBlock.match(/<i:type_id>([^<]+)<\/i:type_id>/);
      const ref = fileBlock.match(/<i:ref>([^<]+)<\/i:ref>/);
      const lang = fileBlock.match(/<i:language_id>([^<]+)<\/i:language_id>/);

      const typeId = type ? type[1].trim() : '';
      const refValue = ref ? ref[1].trim() : '';
      const languageId = lang ? lang[1].trim() : '';

      if (typeId || refValue) {
         refs.push({ type_id: typeId, ref: refValue, language_id: languageId });
      }
   }

   return { fields, refs };
}

function extractBinFilesFromAnswer(responseXml) {
   const out = [];
   const fileRegex = /<File>[\s\S]*?<\/File>/g;
   let match;

   while ((match = fileRegex.exec(responseXml)) !== null) {
      const block = match[0];
      const fileName = (block.match(/<fileName>([^<]+)<\/fileName>/) || [null, ''])[1].trim();
      const type = (block.match(/<type>([^<]+)<\/type>/) || [null, ''])[1].trim();
      const binData = (block.match(/<binData>([\s\S]*?)<\/binData>/) || [null, ''])[1].trim();

      if (binData) {
         out.push({ fileName, type, binData });
      }
   }

   return out;
}

async function opSearch(name, forename, dobDdMmYyyy, nbRecord) {
   const parts = [];
   if (name) parts.push(`<tns:Name>${xmlEscape(name)}</tns:Name>`);
   if (forename) parts.push(`<tns:Forename>${xmlEscape(forename)}</tns:Forename>`);
   if (dobDdMmYyyy) parts.push(`<tns:DateOfBirth>${xmlEscape(dobDdMmYyyy)}</tns:DateOfBirth>`);
   parts.push(`<tns:NbRecord>${Number(nbRecord)}</tns:NbRecord>`);

   const body = `        <tns:Search>
            ${parts.join('')}
        </tns:Search>`;

   const { status, xml, requestXml } = await soapCall('Search', body, true, 60000);
   const fault = extractSoapFault(xml);
   const { resultCode, resultOtherCode, requestId } = parseBasicFields(xml);

   if (status >= 400 || fault) {
      return {
         ok: false,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         hits: [],
      };
   }

   if (resultCode === 'NO_ANSWER') {
      return {
         ok: true,
         httpStatus: status,
         fault: null,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         hits: [],
      };
   }

   if (resultCode !== 'NO_ERROR') {
      return {
         ok: false,
         httpStatus: status,
         fault: null,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         hits: [],
      };
   }

   return {
      ok: true,
      httpStatus: status,
      fault: null,
      resultCode,
      resultOtherCode,
      requestId,
      raw: xml,
      request: requestXml,
      hits: parseSearchHits(xml),
   };
}

async function opDetails(nominalSearchItemId) {
   const body = `        <tns:Details>
            <tns:NominalSearchItemId>${xmlEscape(nominalSearchItemId)}</tns:NominalSearchItemId>
        </tns:Details>`;

   const { status, xml, requestXml } = await soapCall('Details', body, true, 60000);
   const fault = extractSoapFault(xml);
   const { resultCode, resultOtherCode, requestId } = parseBasicFields(xml);

   if (status >= 400 || fault) {
      return {
         ok: false,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         details: null,
      };
   }

   if (resultCode !== 'NO_ERROR') {
      return {
         ok: false,
         httpStatus: status,
         fault: null,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         details: null,
      };
   }

   return {
      ok: true,
      httpStatus: status,
      fault: null,
      resultCode,
      resultOtherCode,
      requestId,
      raw: xml,
      request: requestXml,
      details: parseDetails(xml),
   };
}

async function opGetNoticePdf(pathToNotice) {
   const body = `        <tns:GetNoticePDFFile>
            <tns:PathToNotice>${xmlEscape(pathToNotice)}</tns:PathToNotice>
        </tns:GetNoticePDFFile>`;

   const { status, xml, requestXml } = await soapCall('GetNoticePDFFile', body, false, 120000);
   const fault = extractSoapFault(xml);
   const { resultCode, resultOtherCode, requestId } = parseBasicFields(xml);

   if (status >= 400 || fault || resultCode !== 'NO_ERROR') {
      return {
         ok: false,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         files: [],
      };
   }

   return {
      ok: true,
      httpStatus: status,
      fault: null,
      resultCode,
      resultOtherCode,
      requestId,
      raw: xml,
      request: requestXml,
      files: extractBinFilesFromAnswer(xml),
   };
}

async function opImageFile(nominalItemId, imagePath) {
   const body = `        <tns:ImageFile>
            <tns:NominalItemId>${xmlEscape(nominalItemId)}</tns:NominalItemId>
            <tns:ImagePath>${xmlEscape(imagePath)}</tns:ImagePath>
        </tns:ImageFile>`;

   const { status, xml, requestXml } = await soapCall('ImageFile', body, false, 120000);
   const fault = extractSoapFault(xml);
   const { resultCode, resultOtherCode, requestId } = parseBasicFields(xml);

   if (status >= 400 || fault || resultCode !== 'NO_ERROR') {
      return {
         ok: false,
         httpStatus: status,
         fault,
         resultCode,
         resultOtherCode,
         requestId,
         raw: xml,
         request: requestXml,
         files: [],
      };
   }

   return {
      ok: true,
      httpStatus: status,
      fault: null,
      resultCode,
      resultOtherCode,
      requestId,
      raw: xml,
      request: requestXml,
      files: extractBinFilesFromAnswer(xml),
   };
}

function baseCfg() {
   return {
      endpoint: FIND_ENDPOINT,
      wsUserInfoUsername: WS_USERINFO_USERNAME || '(empty)',
      wsUsernameVersion: WS_USERNAME_VERSION,
      enq: ENQUIRIES_REFERENCE || '(empty)',
      userMasked: masked(FIND_USERNAME),
      pwdMasked: masked(FIND_PASSWORD),
   };
}

function emptyResults() {
   return {
      ok: true,
      httpStatus: '-',
      requestId: '-',
      resultCode: '-',
      resultOtherCode: '-',
      hits: [],
      raw: '',
      request: '',
   };
}

function renderIndex({ error, statusMsg, results, form, cfg }) {
   const statusClass = results.ok ? 'ok' : 'err';

   const rows = results.hits.length
      ? results.hits
           .map(
              (h) => `
        <tr>
          <td><code>${htmlEscape(h.item_id)}</code></td>
          <td>${htmlEscape(h.name)}</td>
          <td>${htmlEscape(h.forename)}</td>
          <td><code>${htmlEscape(h.dob)}</code></td>
          <td><code>${htmlEscape(h.caution)}</code></td>
          <td><code>${htmlEscape(h.score)}</code></td>
          <td><code>${htmlEscape(h.owner_office_id)}</code></td>
          <td><a href="/details?item_id=${encodeURIComponent(h.item_id)}">Details</a></td>
        </tr>`,
           )
           .join('')
      : '';

   return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>FIND Nominal Search</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; }
    input { padding: 6px; margin: 4px 0; width: 340px; }
    button { padding: 8px 14px; margin-top: 10px; }
    .hint { color: #666; font-size: 13px; }
    .err { background: #ffe8e8; padding: 10px; border: 1px solid #ffb3b3; white-space: pre-wrap; }
    .ok  { background: #e8fff0; padding: 10px; border: 1px solid #a9f0c0; white-space: pre-wrap; }
    table { border-collapse: collapse; width: 100%; margin-top: 14px; }
    th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    th { background: #f5f5f5; text-align: left; }
    code { background: #f6f6f6; padding: 2px 4px; }
    details { margin-top: 10px; }
    textarea { width: 100%; height: 220px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .small { font-size: 13px; color: #444; }
  </style>
</head>
<body>
  <h2>INTERPOL FIND - Nominals (Test UI)</h2>

  <div class="small">
    endpoint: <code>${htmlEscape(cfg.endpoint)}</code><br/>
    wsUserInfoUsername: <code>${htmlEscape(cfg.wsUserInfoUsername)}</code> |
    usernameVersion: <code>${htmlEscape(cfg.wsUsernameVersion)}</code> |
    enquiriesReference: <code>${htmlEscape(cfg.enq)}</code><br/>
    username: <code>${htmlEscape(cfg.userMasked)}</code> |
    password: <code>${htmlEscape(cfg.pwdMasked)}</code>
  </div>

  ${error ? `<div class="err"><b>Error:</b> ${htmlEscape(error)}</div>` : ''}

  ${statusMsg ? `<div class="${statusClass}">${htmlEscape(statusMsg)}</div>` : ''}

  <form method="post" action="/search">
    <div>
      <label>Name</label><br/>
      <input name="name" value="${htmlEscape(form.name)}" required>
    </div>
    <div>
      <label>Forename</label><br/>
      <input name="forename" value="${htmlEscape(form.forename)}" required>
    </div>
    <div>
      <label>Date of birth (dd/mm/yyyy) - optional</label><br/>
      <input name="dob" value="${htmlEscape(form.dob)}" placeholder="e.g. 25/10/1983">
      <div class="hint">Format must be <b>dd/mm/yyyy</b>, or leave empty.</div>
    </div>
    <div>
      <label>NbRecord</label><br/>
      <input name="nb" value="${htmlEscape(form.nb)}" type="number" min="1" max="50">
    </div>

    <button type="submit">Search</button>
  </form>

  <h3>Results</h3>
  <div class="small">
    httpStatus: <code>${htmlEscape(results.httpStatus)}</code> |
    requestId: <code>${htmlEscape(results.requestId)}</code> |
    resultCode: <code>${htmlEscape(results.resultCode)}</code> |
    resultOtherCode: <code>${htmlEscape(results.resultOtherCode)}</code>
  </div>

  ${
     results.hits.length === 0
        ? '<div class="hint">No hits returned in xmlData.</div>'
        : `<table>
      <thead><tr>
        <th>item_id</th><th>Name</th><th>Forename</th><th>DOB</th><th>Caution</th><th>Score</th><th>Owner</th><th>Action</th>
      </tr></thead>
      <tbody>${rows}
      </tbody>
    </table>`
  }

  <details>
    <summary>Show SOAP REQUEST</summary>
    <textarea readonly>${htmlEscape(results.request)}</textarea>
  </details>

  <details>
    <summary>Show SOAP RESPONSE</summary>
    <textarea readonly>${htmlEscape(results.raw)}</textarea>
  </details>
</body>
</html>`;
}

function renderDetails({ error, info, itemId }) {
   let body = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Nominal Details</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; }
    .box { border: 1px solid #ddd; padding: 12px; margin: 12px 0; }
    .err { background: #ffe8e8; padding: 10px; border: 1px solid #ffb3b3; white-space: pre-wrap; }
    code { background: #f6f6f6; padding: 2px 4px; }
    a.button { display: inline-block; padding: 8px 12px; border: 1px solid #333; margin-right: 8px; text-decoration: none; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    th { background: #f5f5f5; text-align: left; }
    details { margin-top: 10px; }
    textarea { width: 100%; height: 240px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  </style>
</head>
<body>
  <a href="/">&larr; Back</a>
  <h2>Details</h2>`;

   if (error) {
      body += `<div class="err"><b>Error:</b> ${htmlEscape(error)}</div>`;
   }

   if (info) {
      const fields = info.details && info.details.fields ? info.details.fields : {};
      const refs = info.details && info.details.refs ? info.details.refs : [];

      const fieldsHtml = Object.entries(fields)
         .map(([k, v]) => `<div><b>${htmlEscape(k)}</b>: <code>${htmlEscape(v)}</code></div>`)
         .join('');

      const refsHtml = refs.length
         ? `<table>
        <thead><tr><th>type_id</th><th>ref</th><th>language_id</th><th>Action</th></tr></thead>
        <tbody>
        ${refs
           .map((r) => {
              let action = '&mdash;';
              if ((r.ref || '').includes('TRANSLATED_DOCUMENT')) {
                 action = `<a class="button" href="/download/notice?path=${encodeURIComponent(r.ref || '')}">Download PDF</a>`;
              } else if ((r.ref || '').includes('\\\\PHOTO') || (r.ref || '').includes('/PHOTO')) {
                 action = `<a class="button" href="/download/image?item_id=${encodeURIComponent(itemId)}&path=${encodeURIComponent(r.ref || '')}">Download Photo</a>`;
              }

              return `<tr>
              <td><code>${htmlEscape(r.type_id)}</code></td>
              <td><code>${htmlEscape(r.ref)}</code></td>
              <td><code>${htmlEscape(r.language_id)}</code></td>
              <td>${action}</td>
            </tr>`;
           })
           .join('')}
        </tbody>
      </table>`
         : '<div class="box">No <code>&lt;i:file&gt;</code> refs in Details.</div>';

      body += `
    <div class="box">
      <div>httpStatus: <code>${htmlEscape(info.httpStatus)}</code></div>
      <div>requestId: <code>${htmlEscape(info.requestId)}</code></div>
      <div>resultCode: <code>${htmlEscape(info.resultCode)}</code></div>
      <div>resultOtherCode: <code>${htmlEscape(info.resultOtherCode)}</code></div>
      <div>NominalSearchItemId used: <code>${htmlEscape(itemId)}</code></div>
    </div>

    <h3>Nominal fields</h3>
    <div class="box">${fieldsHtml}</div>

    <h3>File references</h3>
    ${refsHtml}

    <details>
      <summary>Show SOAP REQUEST</summary>
      <textarea readonly>${htmlEscape(info.request || '')}</textarea>
    </details>

    <details>
      <summary>Show SOAP RESPONSE</summary>
      <textarea readonly>${htmlEscape(info.raw || '')}</textarea>
    </details>`;
   }

   body += '\n</body>\n</html>';
   return body;
}

app.get('/', (req, res) => {
   console.log('IN GET');
   res.send(
      renderIndex({
         error: null,
         statusMsg: null,
         results: emptyResults(),
         form: { name: '', forename: '', dob: '', nb: '10' },
         cfg: baseCfg(),
      }),
   );
});

app.post('/search', async (req, res) => {
   const name = (req.body.name || '').trim();
   const forename = (req.body.forename || '').trim();
   const dobInput = (req.body.dob || '').trim();
   const nb = parseInt(req.body.nb || '10', 10);

   try {
      const dob = validateDobDdMmYyyy(dobInput);
      const safeNb = Number.isFinite(nb) && nb > 0 ? nb : 10;
      const result = await opSearch(name, forename, dob, safeNb);

      let statusMsg = '';
      statusMsg += 'Search result:\n';
      statusMsg += `httpStatus=${result.httpStatus}\n`;
      statusMsg += `resultCode=${result.resultCode}\n`;
      statusMsg += `resultOtherCode=${result.resultOtherCode}\n`;
      statusMsg += `requestId=${result.requestId}\n`;
      if (result.fault) {
         statusMsg += `SOAP Fault: ${result.fault}\n`;
      }

      res.send(
         renderIndex({
            error: result.ok ? null : 'Search failed.',
            statusMsg,
            results: result,
            form: { name, forename, dob, nb: String(safeNb) },
            cfg: baseCfg(),
         }),
      );
   } catch (err) {
      res.send(
         renderIndex({
            error: 'Search failed.',
            statusMsg: `Exception:\n${err.message || String(err)}`,
            results: emptyResults(),
            form: { name, forename, dob: dobInput, nb: String(nb || 10) },
            cfg: baseCfg(),
         }),
      );
   }
});

app.get('/details', async (req, res) => {
   const itemId = (req.query.item_id || '').trim();
   if (!itemId) {
      res.status(400).send('missing item_id');
      return;
   }

   const result = await opDetails(itemId);
   if (!result.ok) {
      let msg = '';
      msg += 'Details failed.\n';
      msg += `httpStatus=${result.httpStatus}\n`;
      msg += `resultCode=${result.resultCode}\n`;
      msg += `resultOtherCode=${result.resultOtherCode}\n`;
      msg += `requestId=${result.requestId}\n`;
      if (result.fault) {
         msg += `SOAP Fault: ${result.fault}\n`;
      }

      res.send(renderDetails({ error: msg, info: result, itemId }));
      return;
   }

   res.send(renderDetails({ error: null, info: result, itemId }));
});

app.get('/download/notice', async (req, res) => {
   const noticePath = (req.query.path || '').trim();
   if (!noticePath) {
      res.status(400).send('missing path');
      return;
   }

   const result = await opGetNoticePdf(noticePath);
   if (!result.ok || !result.files.length) {
      res.status(500).send(
         `GetNoticePDFFile failed: resultCode=${result.resultCode} fault=${result.fault}`,
      );
      return;
   }

   const file = result.files[0];
   let filename = file.fileName || path.basename(noticePath) || 'notice.pdf';
   if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
   }

   const data = Buffer.from(file.binData, 'base64');
   res.setHeader('Content-Type', 'application/pdf');
   res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
   res.send(data);
});

app.get('/download/image', async (req, res) => {
   const itemId = (req.query.item_id || '').trim();
   const imagePath = (req.query.path || '').trim();

   if (!itemId || !imagePath) {
      res.status(400).send('missing item_id or path');
      return;
   }

   const result = await opImageFile(itemId, imagePath);
   if (!result.ok || !result.files.length) {
      res.status(500).send(
         `ImageFile failed: resultCode=${result.resultCode} fault=${result.fault}`,
      );
      return;
   }

   const file = result.files[0];
   const filename = file.fileName || path.basename(imagePath) || 'photo.jpg';

   let mime = 'application/octet-stream';
   const low = filename.toLowerCase();
   if (low.endsWith('.jpg') || low.endsWith('.jpeg')) mime = 'image/jpeg';
   else if (low.endsWith('.png')) mime = 'image/png';

   const data = Buffer.from(file.binData, 'base64');
   res.setHeader('Content-Type', mime);
   res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
   res.send(data);
});

app.listen(8000, () => {
   console.log('Started ');
});
