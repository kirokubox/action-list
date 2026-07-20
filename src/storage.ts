// localStorage への保存・読み込み。キーは接頭辞 `action-list-` を厳守する。

import { ListItem, StoredData } from "./types";
import { DIVIDER, repairItems } from "./listOps";

const STORAGE_KEY = "action-list-data";

/** 初期状態（保存なし）: divider 1本のみ */
function initialItems(): ListItem[] {
  return [DIVIDER];
}

export function loadItems(): ListItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialItems();

  try {
    const parsed = JSON.parse(raw) as StoredData;
    if (!parsed || !Array.isArray(parsed.items)) return initialItems();
    return repairItems(parsed.items);
  } catch {
    return initialItems();
  }
}

export function saveItems(items: ListItem[]): void {
  const data: StoredData = { version: 1, items };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
