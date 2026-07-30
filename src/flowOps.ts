// 左側「今回の流れ」の配列操作。すべて純関数。
// 区切り（時間帯マーカー）は持たない。純粋な一列の実行順として扱う。

import { FlowItem, MenuItem } from "./types";

/** 定番メニュー項目から、流れ用の独立した項目を作る（同じ定番を何度でも追加できる）。 */
export function flowItemFromMenu(menuItem: MenuItem): FlowItem {
  return { id: crypto.randomUUID(), menuId: menuItem.id, title: menuItem.title };
}

/**
 * 指定インデックスへ挿入する。
 * index=0 が「先頭に入れる」、index=flow.length が「最後に入れる」。
 */
export function insertFlowAt(flow: FlowItem[], item: FlowItem, index: number): FlowItem[] {
  const clamped = Math.max(0, Math.min(index, flow.length));
  return [...flow.slice(0, clamped), item, ...flow.slice(clamped)];
}

/** 流れから外し、外した項目と元のインデックスを返す（アンドゥ用）。定番メニューには影響しない。 */
export function removeFlowItem(
  flow: FlowItem[],
  id: string,
): { flow: FlowItem[]; removed: FlowItem; index: number } | null {
  const index = flow.findIndex((item) => item.id === id);
  if (index === -1) return null;
  return {
    flow: [...flow.slice(0, index), ...flow.slice(index + 1)],
    removed: flow[index],
    index,
  };
}

/** アンドゥ：元のインデックス位置へ戻す。 */
export function restoreFlowAt(flow: FlowItem[], item: FlowItem, index: number): FlowItem[] {
  const clamped = Math.max(0, Math.min(index, flow.length));
  return [...flow.slice(0, clamped), item, ...flow.slice(clamped)];
}
