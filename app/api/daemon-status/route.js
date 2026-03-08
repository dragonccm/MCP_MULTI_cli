import { getDaemonStatus } from '../../../lib/dashboard-runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const daemon = await getDaemonStatus();
  return Response.json(daemon);
}
