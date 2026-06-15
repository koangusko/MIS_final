import { env, llmConfigured } from './env';

export type ParsedApp = { label: string; minutes: number };
export type ParseResult = {
  ok: boolean;
  reason?: string; // 失敗原因（need_reupload 用）
  date: string | null; // 截圖上顯示的日期 YYYY-MM-DD（若讀得出）
  totalMinutes: number | null;
  apps: ParsedApp[];
};

const SYSTEM_PROMPT = `你是解析 iPhone「螢幕使用時間」截圖的助手。
從圖片讀出：畫面顯示的日期、每個 App 名稱與其使用時間（一律換算成「分鐘」整數）、以及總計時間（分鐘）。
時間換算範例：「1 小時 5 分」=65、「30 分鐘」=30、「2 時」=120。
只輸出 JSON，格式如下，不要輸出任何 JSON 以外的文字、不要用 markdown 圍欄：
{"date":"YYYY-MM-DD 或 null","totalMinutes":數字或 null,"apps":[{"label":"App 名稱","minutes":數字}]}
若圖片不是「螢幕使用時間」頁、或完全讀不出任何數字，請改輸出：{"error":"簡短原因"}`;

function extractJson(text: string): any | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeApps(raw: unknown): ParsedApp[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => ({
      label: String((a as any)?.label ?? '').trim(),
      minutes: Math.round(Number((a as any)?.minutes)),
    }))
    .filter((a) => a.label && Number.isFinite(a.minutes) && a.minutes >= 0);
}

function mockParse(): ParseResult {
  const apps: ParsedApp[] = [
    { label: '短影音 A', minutes: 38 },
    { label: '社群相簿', minutes: 22 },
    { label: '影音平台', minutes: 10 },
    { label: '動態社群', minutes: 6 },
  ];
  return { ok: true, date: null, totalMinutes: apps.reduce((s, a) => s + a.minutes, 0), apps };
}

/** 解析一張螢幕使用時間截圖（傳入 base64 data URL）。 */
export async function parseScreenshot(imageDataUrl: string): Promise<ParseResult> {
  if (env.LLM_MOCK) return mockParse();
  if (!llmConfigured) {
    return { ok: false, reason: 'llm_not_configured', date: null, totalMinutes: null, apps: [] };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch(`${env.OPENCODE_BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENCODE_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: '解析這張螢幕使用時間截圖，依規定只回 JSON。' },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, reason: `llm_http_${res.status}: ${body.slice(0, 200)}`, date: null, totalMinutes: null, apps: [] };
    }

    const data = (await res.json()) as any;
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    const parsed = extractJson(content);
    if (!parsed) {
      return { ok: false, reason: 'llm_unparseable_response', date: null, totalMinutes: null, apps: [] };
    }
    if (parsed.error) {
      return { ok: false, reason: String(parsed.error).slice(0, 200), date: null, totalMinutes: null, apps: [] };
    }

    const apps = normalizeApps(parsed.apps);
    if (apps.length === 0) {
      return { ok: false, reason: 'no_apps_detected', date: null, totalMinutes: null, apps: [] };
    }
    const total = Number.isFinite(Number(parsed.totalMinutes))
      ? Math.round(Number(parsed.totalMinutes))
      : apps.reduce((s, a) => s + a.minutes, 0);
    const date = typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null;

    return { ok: true, date, totalMinutes: total, apps };
  } catch (err) {
    const reason = (err as Error)?.name === 'AbortError' ? 'llm_timeout' : `llm_error: ${(err as Error)?.message}`;
    return { ok: false, reason, date: null, totalMinutes: null, apps: [] };
  } finally {
    clearTimeout(timer);
  }
}
