// 公開版の汎用初期メニュー。
// 用途が伝わることだけを目的にした架空・汎用データで、個人の実データは含めない。
// 初回起動時（保存データが無いとき）に定番メニューへ投入し、
// 既存ユーザーには自動投入しない（⋯メニューの「サンプルメニューを追加」から任意で追加できる）。

import { MenuItem } from "./types";

export const SAMPLE_MENU: MenuItem[] = [
  // 食事・身支度
  { id: "sample-001", title: "朝食", category: "食事・身支度" },
  { id: "sample-002", title: "昼食", category: "食事・身支度" },
  { id: "sample-003", title: "夕食", category: "食事・身支度" },
  { id: "sample-004", title: "料理", category: "食事・身支度" },
  { id: "sample-005", title: "食器洗い", category: "食事・身支度" },
  { id: "sample-006", title: "シャワー", category: "食事・身支度" },
  { id: "sample-007", title: "外出準備", category: "食事・身支度" },
  { id: "sample-008", title: "明日の準備", category: "食事・身支度" },
  // 家事・生活
  { id: "sample-009", title: "洗濯を回す", category: "家事・生活" },
  { id: "sample-010", title: "洗濯を干す", category: "家事・生活" },
  { id: "sample-011", title: "洗濯を畳む", category: "家事・生活" },
  { id: "sample-012", title: "掃除", category: "家事・生活" },
  { id: "sample-013", title: "整理整頓", category: "家事・生活" },
  { id: "sample-014", title: "買い物", category: "家事・生活" },
  { id: "sample-015", title: "散歩", category: "家事・生活" },
  { id: "sample-016", title: "休憩", category: "家事・生活" },
  // 趣味・インプット
  { id: "sample-017", title: "アニメ・動画を見る", category: "趣味・インプット" },
  { id: "sample-018", title: "マンガを読む", category: "趣味・インプット" },
  { id: "sample-019", title: "本を読む", category: "趣味・インプット" },
  { id: "sample-020", title: "ゲーム", category: "趣味・インプット" },
  { id: "sample-021", title: "調べもの", category: "趣味・インプット" },
  { id: "sample-022", title: "勉強", category: "趣味・インプット" },
  // 作業・制作
  { id: "sample-023", title: "考えを整理する", category: "作業・制作" },
  { id: "sample-024", title: "文章を書く", category: "作業・制作" },
  { id: "sample-025", title: "作業を進める", category: "作業・制作" },
  { id: "sample-026", title: "振り返る", category: "作業・制作" },
];
