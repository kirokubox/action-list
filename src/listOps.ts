// 区切り（divider）基準の配列操作をここに集約する純関数群。
// App.tsx や storage.ts からはこの関数だけを通して items 配列を触る。

import { ActionItem, DividerItem, ListItem, isDivider } from "./types";

export const DIVIDER: DividerItem = { id: "divider", type: "divider" };

/** items の中から divider の位置を探す。見つからない場合は -1。 */
export function dividerIndex(items: ListItem[]): number {
  return items.findIndex((item) => isDivider(item));
}

/**
 * 読み込み時の修復。divider が0本なら末尾に追加、2本以上なら最初の1本だけ残す。
 */
export function repairItems(items: ListItem[]): ListItem[] {
  const dividers = items.filter((item) => isDivider(item));
  if (dividers.length === 1) return items;

  const withoutDividers = items.filter((item) => !isDivider(item));
  if (dividers.length === 0) {
    // 末尾に1本追加
    return [...withoutDividers, DIVIDER];
  }
  // 2本以上：最初の1本だけ残し、元の並び順（divider以外）を維持して末尾に置く
  // → 最初に見つかった divider の位置relative順を保つため、元の items の並びから
  //   最初の divider の位置に1本だけ挿入し直す
  const firstDividerPos = items.findIndex((item) => isDivider(item));
  const beforeItems = items.slice(0, firstDividerPos).filter((item) => !isDivider(item));
  const afterItems = items.slice(firstDividerPos + 1).filter((item) => !isDivider(item));
  return [...beforeItems, DIVIDER, ...afterItems];
}

/** 指定 id の項目を divider の直上（「これから」ゾーン最下部）へ移動する。右スワイプ＝スキップ用。 */
export function moveAboveDivider(items: ListItem[], id: string): ListItem[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  const rest = items.filter((item) => item.id !== id);
  const divIdx = dividerIndex(rest);
  if (divIdx === -1) return items;
  return [...rest.slice(0, divIdx), target, ...rest.slice(divIdx)];
}

/** 指定 id の項目を divider の直下へ移動する。左スワイプ（繰り返し項目）用。 */
export function insertBelowDivider(items: ListItem[], id: string): ListItem[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  const rest = items.filter((item) => item.id !== id);
  const divIdx = dividerIndex(rest);
  if (divIdx === -1) return items;
  return [...rest.slice(0, divIdx + 1), target, ...rest.slice(divIdx + 1)];
}

/** 新規項目を divider の直上へ挿入する。追加フォーム用。 */
export function insertAboveDivider(items: ListItem[], item: ActionItem): ListItem[] {
  const divIdx = dividerIndex(items);
  if (divIdx === -1) return [...items, item];
  return [...items.slice(0, divIdx), item, ...items.slice(divIdx)];
}

/** 指定 id の項目を削除し、削除した項目と元のインデックスを返す（アンドゥ用）。 */
export function removeWithIndex(
  items: ListItem[],
  id: string,
): { items: ListItem[]; removed: ActionItem; index: number } | null {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const removed = items[index];
  if (isDivider(removed)) return null;
  return {
    items: [...items.slice(0, index), ...items.slice(index + 1)],
    removed,
    index,
  };
}

/** アンドゥ：元のインデックス位置へ項目を復元する。 */
export function restoreAt(items: ListItem[], item: ActionItem, index: number): ListItem[] {
  const clampedIndex = Math.min(index, items.length);
  return [...items.slice(0, clampedIndex), item, ...items.slice(clampedIndex)];
}

/** dnd-kit の並べ替え結果（配列そのまま）を受け取り、divider の本数を保証して返す。 */
export function reorderAll(newOrder: ListItem[]): ListItem[] {
  return repairItems(newOrder);
}

export type ImportResult = {
  items: ListItem[];
  addedCount: number;
  skippedCount: number;
};

/**
 * JSON インポート（追加型）。
 * - type==="divider" または id==="divider" の要素はスキップ
 * - 既存 id と重複する項目は追加しない
 * - isSingle が無い項目は false（繰り返し）として取り込む
 * - 取り込み順を保って divider の直上へ挿入
 */
export function additiveImport(items: ListItem[], rawItems: unknown[]): ImportResult {
  const existingIds = new Set(items.map((item) => item.id));
  const toAdd: ActionItem[] = [];
  let skippedCount = 0;

  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) {
      skippedCount++;
      continue;
    }
    const candidate = raw as Record<string, unknown>;
    if (candidate.type === "divider" || candidate.id === "divider") {
      continue; // divider はスキップ（カウントしない）
    }
    const id = typeof candidate.id === "string" ? candidate.id : undefined;
    const title = typeof candidate.title === "string" ? candidate.title : undefined;
    if (!id || !title) {
      skippedCount++;
      continue;
    }
    if (existingIds.has(id) || toAdd.some((item) => item.id === id)) {
      skippedCount++;
      continue;
    }
    const actionItem: ActionItem = {
      id,
      title,
      isSingle: typeof candidate.isSingle === "boolean" ? candidate.isSingle : false,
    };
    if (typeof candidate.category === "string") {
      actionItem.category = candidate.category;
    }
    toAdd.push(actionItem);
  }

  let result = items;
  for (const item of toAdd) {
    result = insertAboveDivider(result, item);
  }

  return { items: result, addedCount: toAdd.length, skippedCount };
}
