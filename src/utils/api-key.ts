import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return `sk_blank_test_${randomBytes(32).toString('hex')}`;
} 