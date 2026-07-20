type Props = {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** 画面下部に一時表示するスナックバー。削除アンドゥ・インポート結果の表示に使う。 */
export function Snackbar({ text, actionLabel, onAction }: Props) {
  return (
    <div className="snackbar">
      <span className="snackbar-text">{text}</span>
      {actionLabel && onAction && (
        <button type="button" className="snackbar-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
