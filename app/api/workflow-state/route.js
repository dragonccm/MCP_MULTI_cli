import { getWorkflowState } from '../../../lib/dashboard-runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const state = await getWorkflowState();
  return Response.json(state);
}
