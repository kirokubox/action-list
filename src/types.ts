// action-order のデータ型。
// 完了記録・回数・日付・締切は一切持たない（かぞえ帳=回数/最終日、Googleカレンダー=実績時間、
// 本アプリ=次やる順番、というSOT分担のため）。
//
// 構造は音楽アプリのプレイリストに近い。
// - menu（定番メニュー）= 右側。保存対象。行動の「マスター」
// - flow（今回の流れ）  = 左側。直近数時間の実行順を組む一時リスト

/** 右側の定番メニュー1件。保存対象のマスターデータ。 */
export type MenuItem = {
  id: string;
  title: string;
  category?: string; // UIには表示しない（将来の色分け・整理用として保持）
};

/**
 * 左側「今回の流れ」1件。
 * 同じ定番メニューを何度でも追加できるよう、追加ごとに独立した id を持つ。
 * title は追加時点のスナップショット（定番メニュー名の編集に追随させる同期は持たない）。
 */
export type FlowItem = {
  id: string;
  menuId?: string; // 由来の定番メニューid。手掛かりとして持つだけで、参照解決には使わない
  title: string;
};

/** localStorage に保存する形（v2）。 */
export type StoredData = {
  version: 2;
  menu: MenuItem[];
  flow: FlowItem[];
};

// ---- v1（初期実装）の形。移行のためだけに残す ----

/** v1の項目。isSingle（単発/繰り返し）は v2 で概念自体を廃止した。 */
export type LegacyActionItem = {
  id: string;
  title: string;
  category?: string;
  isSingle?: boolean;
};

export type LegacyStoredData = {
  version: 1;
  items: (LegacyActionItem | { id: "divider"; type: "divider" })[];
};
