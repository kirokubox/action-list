// localStorage への保存・読み込みと、v1（初期実装）からの移行。
// キーは接頭辞 `action-list-` を厳守する（リポジトリ名がそのまま残っているため）。

import { FlowItem, MenuItem, StoredData } from "./types";
import { SAMPLE_MENU } from "./sampleMenu";

const STORAGE_KEY = "action-list-data";
/** 移行前の生データを1回だけ退避しておくキー（万一の取りこぼしを手で救えるようにする保険）。 */
const LEGACY_BACKUP_KEY = "action-list-data-v1-backup";
/** 壊れたJSONを上書きしてしまう前に退避しておくキー。 */
const BROKEN_BACKUP_KEY = "action-list-data-broken-backup";

export type LoadResult = {
  menu: MenuItem[];
  flow: FlowItem[];
  /** 初回起動（保存データが無く、汎用サンプルを投入した）かどうか */
  seeded: boolean;
  /** v1データからの移行を行ったかどうか */
  migrated: boolean;
};

function stashOnce(key: string, raw: string): void {
  try {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
  } catch {
    // 容量不足などで退避できなくても本処理は続ける
  }
}

/** 未知の値の配列から MenuItem 配列を作る。title が無い要素と重複idは落とす。 */
function toMenuItems(rawItems: unknown[]): MenuItem[] {
  const seenIds = new Set<string>();
  const result: MenuItem[] = [];
  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) continue;
    const candidate = raw as Record<string, unknown>;
    if (candidate.type === "divider" || candidate.id === "divider") continue; // v1の区切りは移行しない
    const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
    if (!title) continue;
    let id = typeof candidate.id === "string" && candidate.id ? candidate.id : crypto.randomUUID();
    while (seenIds.has(id)) id = crypto.randomUUID();
    seenIds.add(id);
    const item: MenuItem = { id, title };
    if (typeof candidate.category === "string") item.category = candidate.category;
    result.push(item);
  }
  return result;
}

function toFlowItems(rawItems: unknown[]): FlowItem[] {
  const seenIds = new Set<string>();
  const result: FlowItem[] = [];
  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) continue;
    const candidate = raw as Record<string, unknown>;
    const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
    if (!title) continue;
    let id = typeof candidate.id === "string" && candidate.id ? candidate.id : crypto.randomUUID();
    while (seenIds.has(id)) id = crypto.randomUUID();
    seenIds.add(id);
    const item: FlowItem = { id, title };
    if (typeof candidate.menuId === "string") item.menuId = candidate.menuId;
    result.push(item);
  }
  return result;
}

export function load(): LoadResult {
  const raw = localStorage.getItem(STORAGE_KEY);

  // 初回起動：汎用サンプルメニューを投入し、左側（今回の流れ）は空で始める
  if (raw === null) {
    return { menu: SAMPLE_MENU.map((item) => ({ ...item })), flow: [], seeded: true, migrated: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // 壊れていた場合は生データを退避してから空で開く（サンプルは投入しない＝重複投入を避ける）
    stashOnce(BROKEN_BACKUP_KEY, raw);
    return { menu: [], flow: [], seeded: false, migrated: false };
  }

  if (typeof parsed !== "object" || parsed === null) {
    stashOnce(BROKEN_BACKUP_KEY, raw);
    return { menu: [], flow: [], seeded: false, migrated: false };
  }

  const obj = parsed as Record<string, unknown>;

  // v2：そのまま読む
  if (Array.isArray(obj.menu)) {
    return {
      menu: toMenuItems(obj.menu),
      flow: Array.isArray(obj.flow) ? toFlowItems(obj.flow) : [],
      seeded: false,
      migrated: false,
    };
  }

  // v1：items（区切り込みの1列リスト）を定番メニューへ移す。今回の流れは空で始める。
  if (Array.isArray(obj.items)) {
    stashOnce(LEGACY_BACKUP_KEY, raw);
    return { menu: toMenuItems(obj.items), flow: [], seeded: false, migrated: true };
  }

  stashOnce(BROKEN_BACKUP_KEY, raw);
  return { menu: [], flow: [], seeded: false, migrated: false };
}

export function save(menu: MenuItem[], flow: FlowItem[]): void {
  const data: StoredData = { version: 2, menu, flow };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
