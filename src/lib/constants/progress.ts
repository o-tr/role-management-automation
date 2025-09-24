/**
 * 進捗管理で使用される定数
 */

// 差分取得処理の段階数
export const DIFF_FETCH_STAGES = {
  TOTAL: 4,
  MEMBERS: 1,
  MAPPINGS: 2,
  GROUPS: 3,
  COMPLETE: 4,
} as const;

// 差分計算処理の段階数
export const DIFF_CALCULATION_STAGES = {
  TOTAL: 1,
  COMPLETE: 1,
} as const;

// 差分適用時の検証段階数
export const APPLY_VALIDATION_STAGES = {
  TOTAL: 1,
  COMPLETE: 1,
} as const;

// 進捗表示メッセージ
export const PROGRESS_MESSAGES = {
  DATABASE_INIT: "データベースからの初期データ取得中...",
  MEMBERS_FETCH: "メンバー情報を取得中...",
  MAPPINGS_FETCH: "ロールマッピング情報を取得中...",
  GROUPS_FETCH: "外部サービスグループ情報を取得中...",
  DATABASE_COMPLETE: "初期データ取得完了",
  DIFF_CALCULATING: "差分を計算中...",
  DIFF_VALIDATING: "差分を検証中...",
  DIFF_VALIDATION_COMPLETE: "差分検証完了",
} as const;
