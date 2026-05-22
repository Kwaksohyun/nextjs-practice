import crypto from "crypto";

/**
 * 카페24 앱 실행 URL HMAC 검증
 * - 쿼리는 URL 인코딩된 원문 그대로 사용 (searchParams 재조합 금지)
 * - plain_query = hmac 파라미터를 제외한 나머지
 * @see https://developers.cafe24.com (앱 실행 URL 인증)
 */
export function getRawQueryString(requestUrl: string): string {
  const q = requestUrl.indexOf("?");
  if (q === -1) return "";
  return requestUrl.slice(q + 1);
}

/**
 * 카페24 공식 예제와 동일:
 * plain_query = query_string.substring(0, query_string.lastIndexOf("&"))
 */
export function extractPlainQuery(rawQuery: string): string | null {
  const lastAmp = rawQuery.lastIndexOf("&");
  if (lastAmp === -1) return null;
  return rawQuery.substring(0, lastAmp);
}

export function extractHmacParam(rawQuery: string): string | null {
  const marker = "&hmac=";
  const idx = rawQuery.lastIndexOf(marker);
  if (idx === -1) return null;
  const encoded = rawQuery.substring(idx + marker.length);
  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function computeCafe24Hmac(
  plainQuery: string,
  secretKey: string,
): string {
  return crypto
    .createHmac("sha256", secretKey.trim())
    .update(plainQuery, "utf-8")
    .digest("base64");
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Client Secret으로 검증 (공식: AppEnv.SECRET_KEY = Client Secret) */
export function verifyCafe24AppHmac(
  requestUrl: string,
  secretKeys: string[],
): boolean {
  const rawQuery = getRawQueryString(requestUrl);
  const plainQuery = extractPlainQuery(rawQuery);
  const receivedHmac = extractHmacParam(rawQuery);

  if (!plainQuery || !receivedHmac) {
    return false;
  }

  for (const key of secretKeys) {
    const trimmed = key?.trim();
    if (!trimmed) continue;

    const computed = computeCafe24Hmac(plainQuery, trimmed);
    if (timingSafeEqual(computed, receivedHmac)) {
      return true;
    }
  }

  return false;
}
