import { Logger } from '@nestjs/common';

export interface WithRetryOptions {
  maxRetries?: number;
}

export async function withRetry(tag: string, fn: (...params: any[]) => Promise<any>, options?: WithRetryOptions) {
  const maxRetries = options?.maxRetries || 0;
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (ex) {
      retries++;
      Logger.error(`${tag} Retry: ${retries} Error: ${ex.error?.message || ex.message || ex}`);
      if (maxRetries !== 0 && retries > maxRetries) {
        throw ex;
      }
    }
  }
}
