import { UnauthorizedException } from '@nestjs/common';

export function assertAdminSecret(
  headers: Record<string, string | string[] | undefined>,
) {
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) {
    throw new UnauthorizedException('Administrative access is not configured');
  }

  const receivedSecret = headers['x-admin-secret'];
  const normalizedSecret = Array.isArray(receivedSecret)
    ? receivedSecret[0]
    : receivedSecret;

  if (normalizedSecret !== expectedSecret) {
    throw new UnauthorizedException('Invalid admin secret');
  }
}
