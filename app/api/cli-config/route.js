import { loadCliConfig, saveCliConfig, ROLE_KEYS } from '../../../lib/dashboard-runtime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(loadCliConfig());
}

export async function POST(request) {
  try {
    const data = await request.json();
    const next = {};
    for (const key of ROLE_KEYS) {
      if (data[key]) next[key] = String(data[key]).toLowerCase();
    }
    const config = saveCliConfig(next);
    return Response.json({ ok: true, config });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
