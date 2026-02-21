import { XMLParser } from 'fast-xml-parser';

const EJBCA_STATUS = {
  10: "REVOKED",
  20: "NEW",
  30: "GENERATED",
  40: "ACTIVE",
  80: "HISTORICAL",
};
const REVOCATION_REASONS = {
  0: "UNSPECIFIED",
  1: "KEY_COMPROMISE",
  2: "CA_COMPROMISE",
  3: "AFFILIATION_CHANGED",
  4: "SUPERSEDED",
  5: "CESSATION_OF_OPERATION",
  6: "CERTIFICATE_HOLD",
};

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

export const parseFindUserResponse = (xml) => {
  const json = parser.parse(xml);

  const result =
    json?.Envelope?.Body?.findUserResponse?.return ||
    json?.["soap:Envelope"]?.["soap:Body"]?.findUserResponse?.return;

  if (!result) {
    return {
      exists: false,
      raw: json,
    };
  }

  /** Normalize extendedInformation to array */
  const extendedInfoArray = Array.isArray(result.extendedInformation)   ? result.extendedInformation   : result.extendedInformation     ? [result.extendedInformation]     : [];

  /** Key → value map (normalized access) */
  const extendedMap = {};
  for (const item of extendedInfoArray) {
    if (item?.name) {
      extendedMap[item.name] = item.value ?? null;
    }
  }

  const statusCode = Number(result.status);

  return {
    /** High-level flags */
    exists: true,
    canSign: statusCode === 40,

    /** Normalized fields */
    username: result.username ?? null,
    caName: result.caName ?? null,
    certificateProfileName: result.certificateProfileName ?? null,
    endEntityProfileName: result.endEntityProfileName ?? null,
    subjectDN: result.subjectDN ?? null,
    tokenType: result.tokenType ?? null,
    clearPwd: result.clearPwd === "true",
    keyRecoverable: result.keyRecoverable === "true",
    sendNotification: result.sendNotification === "true",

    /** Status */
    statusCode,
    status: EJBCA_STATUS[statusCode] || "UNKNOWN",

    /** Revocation */
    revocationReasonCode: extendedMap.customdata_REVOCATIONREASON
      ? Number(extendedMap.customdata_REVOCATIONREASON)
      : null,
    revocationReason: REVOCATION_REASONS[extendedMap.customdata_REVOCATIONREASON] || null,

    /** Extended info */
    extendedInformation: extendedInfoArray,
    extendedMap,
  };
};
