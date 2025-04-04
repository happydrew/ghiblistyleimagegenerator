import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedId: string | null = null;

export async function getVisitorId(): Promise<string> {
  if (cachedId) return cachedId;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedId = result.visitorId;
  return result.visitorId;
}