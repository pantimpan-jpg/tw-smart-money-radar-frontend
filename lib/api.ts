export type StockRow = {
  stock_id: string;
  name: string;
  theme?: string;
  group?: string;
  close: number;
  volume_ratio: number;
  turnover_100m: number;
  score_total: number;
  radar_tag: string;
  institution_score?: number;
  broker_score?: number;
  main_force_score?: number;
  revenue_yoy?: number;
  revenue_mom?: number;
  pct_5d?: number;
  pct_20d?: number;
}

export type ScanPayload = {
  generated_at?: string;
  summary: {
    market_scanned: number;
    selected: number;
    starting_count: number;
    second_wave_count: number;
    overheated_count: number;
  };
  top30: StockRow[];
  watchlist: StockRow[];
  starting: StockRow[];
  second_wave: StockRow[];
  broker_track: StockRow[];
  overheated: StockRow[];
  high_turnover: StockRow[];
  all_selected: StockRow[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function getLatestScan(): Promise<ScanPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/api/scan/latest`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function runScan() {
  const res = await fetch(`${API_BASE}/api/scan/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Run scan failed');
  return res.json();
}
