import { FlowItem } from "../types";

type Props = {
  /** 追加しようとしている定番メニューの名称 */
  title: string;
  flow: FlowItem[];
  onSelect: (index: number) => void;
  onClose: () => void;
};

/**
 * 定番メニューをタップしたときに開く挿入位置の選択シート。
 * 「朝」「帰宅後」のような時間帯から選ぶのではなく、いまの並びの具体的な位置を選ぶ。
 * 先頭・各項目の間・末尾のすべてを選べる。
 */
export function InsertPositionSheet({ title, flow, onSelect, onClose }: Props) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet sheet-tall" onClick={(e) => e.stopPropagation()}>
        <h2 className="sheet-title">「{title}」をどこに入れますか？</h2>

        <div className="insert-list">
          <button type="button" className="insert-slot insert-slot-edge" onClick={() => onSelect(0)}>
            先頭に入れる
          </button>

          {flow.map((item, index) => (
            <div key={item.id}>
              <div className="insert-peek">{item.title}</div>
              {index < flow.length - 1 && (
                <button type="button" className="insert-slot" onClick={() => onSelect(index + 1)}>
                  ── ここに入れる ──
                </button>
              )}
            </div>
          ))}

          {flow.length > 0 && (
            <button type="button" className="insert-slot insert-slot-edge" onClick={() => onSelect(flow.length)}>
              最後に入れる
            </button>
          )}
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
