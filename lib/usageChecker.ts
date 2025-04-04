import { getVisitorId } from './fingerprint';
import { getUsageCount, incrementUsage } from './hybridStorage';

export async function checkFreeUsage(): Promise<number> {
    const id = await getVisitorId();
    return await getUsageCount(id);
}

export async function useOneFreeGeneration() {
    const id = await getVisitorId();
    await incrementUsage(id);
}
