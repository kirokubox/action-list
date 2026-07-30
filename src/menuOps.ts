// 右側「定番メニュー」の配列操作。すべて純関数。
// 定番メニューは保存対象のマスターデータなので、破壊的な操作はここに集約して見通しを保つ。

import { MenuItem } from "./types";

export function newMenuItem(title: string, category?: string): MenuItem {
  const item: MenuItem = { id: crypto.randomUUID(), title };
  if (category) item.category = category;
  return item;
}

/** 末尾へ追加する。 */
export function appendMenuItem(menu: MenuItem[], item: MenuItem): MenuItem[] {
  return [...menu, item];
}

/** 名称を変更する。 */
export function renameMenuItem(menu: MenuItem[], id: string, title: string): MenuItem[] {
  return menu.map((item) => (item.id === id ? { ...item, title } : item));
}

/** 削除し、削除した項目と元のインデックスを返す（アンドゥ用）。 */
export function removeMenuItem(
  menu: MenuItem[],
  id: string,
): { menu: MenuItem[]; removed: MenuItem; index: number } | null {
  const index = menu.findIndex((item) => item.id === id);
  if (index === -1) return null;
  return {
    menu: [...menu.slice(0, index), ...menu.slice(index + 1)],
    removed: menu[index],
    index,
  };
}

/** アンドゥ：元のインデックス位置へ戻す。 */
export function restoreMenuItemAt(menu: MenuItem[], item: MenuItem, index: number): MenuItem[] {
  const clamped = Math.max(0, Math.min(index, menu.length));
  return [...menu.slice(0, clamped), item, ...menu.slice(clamped)];
}

export type MenuImportResult = {
  menu: MenuItem[];
  addedCount: number;
  skippedCount: number;
};

/**
 * 定番メニューへの追加型インポート。既存項目は消さない。
 * - id が既存と重複する項目はスキップ
 * - 名称（前後の空白を除いた文字列）が既存と重複する項目もスキップ（同名の定番が2枚できないように）
 * - id が無い項目は新しい id を振って取り込む
 */
export function additiveMenuImport(menu: MenuItem[], rawItems: unknown[]): MenuImportResult {
  const existingIds = new Set(menu.map((item) => item.id));
  const existingTitles = new Set(menu.map((item) => item.title.trim()));
  const toAdd: MenuItem[] = [];
  let skippedCount = 0;

  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) {
      skippedCount++;
      continue;
    }
    const candidate = raw as Record<string, unknown>;
    // v1バックアップの区切り要素は移行対象外（カウントもしない）
    if (candidate.type === "divider" || candidate.id === "divider") continue;

    const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
    if (!title) {
      skippedCount++;
      continue;
    }
    const id = typeof candidate.id === "string" && candidate.id ? candidate.id : crypto.randomUUID();
    if (existingIds.has(id) || existingTitles.has(title)) {
      skippedCount++;
      continue;
    }
    existingIds.add(id);
    existingTitles.add(title);

    const item: MenuItem = { id, title };
    if (typeof candidate.category === "string") item.category = candidate.category;
    toAdd.push(item);
  }

  return { menu: [...menu, ...toAdd], addedCount: toAdd.length, skippedCount };
}

/**
 * インポートJSONから「定番メニューの候補配列」を取り出す。
 * v2形式（menu）・v1形式（items）・素の配列のいずれも受け付ける。
 * 形が違う場合は null を返す。
 */
export function extractMenuSource(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed !== "object" || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(obj.menu)) return obj.menu;
  if (Array.isArray(obj.items)) return obj.items; // v1バックアップ・旧シードJSON
  return null;
}
