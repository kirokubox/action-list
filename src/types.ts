// action-list のデータ型。
// 完了記録・回数・日付・締切は一切持たない（かぞえ帳=回数/最終日、Googleカレンダー=実績時間、
// 本アプリ=次やる順番、というSOT分担のため）。

export type ActionItem = {
  id: string;
  title: string;
  category?: string; // v1ではUIに表示しない（データには保持する）
  isSingle: boolean; // true=単発（左スワイプで削除） / false=繰り返し
};

export type DividerItem = { id: "divider"; type: "divider" }; // リスト内に常に1本だけ

export type ListItem = ActionItem | DividerItem;

export function isDivider(item: ListItem): item is DividerItem {
  return item.id === "divider";
}

// localStorage に保存する形。
export type StoredData = {
  version: 1;
  items: ListItem[];
};
