import { getMCPStatus } from '../../../lib/dashboard-runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(getMCPStatus());
}
