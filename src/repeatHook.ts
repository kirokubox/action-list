// 繰り返し項目を「左スワイプで区切りの下へ戻した」タイミングで必ず経由するフック。
// v1では何もしない。将来、かぞえ帳と連携する共有キュー `yuki-link-events-*`（localStorage）へ
// イベントを送出する処理をここに差し込む想定（本アプリ側は「次やる順番」のSOTのまま、
// 実施の記録だけをかぞえ帳側へ渡すイメージ）。
import { ActionItem } from "./types";

export function notifyRepeatCompleted(item: ActionItem): void {
  // 現状は何もしない（将来のかぞえ帳連携フック）
  void item;
}
