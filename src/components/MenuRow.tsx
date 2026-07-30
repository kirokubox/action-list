import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem } from "../types";

type Props = {
  item: MenuItem;
  editing: boolean;
  onPick: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
};

/**
 * 右側「定番メニュー」1行。縦幅を取りすぎないコンパクトな行表示。
 * - 通常モード：タップすると挿入位置の選択へ進む
 * - 編集モード：タップで名称編集シート、長押しドラッグでメニュー内の並べ替え
 *
 * 列が狭いため名称は2行までで省略する。全文は編集シートで確認できる。
 */
export function MenuRow({ item, editing, onPick, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !editing,
  });

  const style: CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={`menu-row ${editing ? "menu-row-editing" : ""} ${isDragging ? "menu-row-dragging" : ""}`}
      style={style}
      title={item.title}
      aria-label={editing ? `${item.title} を編集` : `${item.title} を今回の流れに追加`}
      onClick={() => (editing ? onEdit(item) : onPick(item))}
      {...attributes}
      {...(editing ? listeners : {})}
    >
      {editing && (
        <span className="menu-row-handle" aria-hidden="true">
          ⋮⋮
        </span>
      )}
      <span className="menu-row-title">{item.title}</span>
    </button>
  );
}
