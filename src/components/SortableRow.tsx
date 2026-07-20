import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionItem, ListItem, isDivider } from "../types";

// スワイプの発火しきい値。横移動が約72px以上、かつ |dx| > |dy|×1.5 のときだけ発火する。
const SWIPE_THRESHOLD = 72;
const SWIPE_RATIO = 1.5;
// この距離を超えて動くまでは「横スワイプか縦スクロールか」を判定しない（軽いタップ対策）
const AXIS_LOCK_DISTANCE = 10;

type Props = {
  item: ListItem;
  onSwipeRight: (id: string) => void;
  onSwipeLeftRepeat: (item: ActionItem) => void;
  onSwipeLeftDelete: (item: ActionItem) => void;
};

type PointerState = {
  startX: number;
  startY: number;
  pointerId: number;
  axis: "none" | "x" | "y";
};

/**
 * 1行分のカード（項目 or 区切り）。
 * - dnd-kit の useSortable で長押しドラッグ（並べ替え）に対応
 * - 自前の pointer イベントで横スワイプ（スキップ / 繰り返し完了 / 削除）に対応
 * dnd-kit のドラッグがアクティブな間はスワイプを無効化する。
 */
export function SortableRow({ item, onSwipeRight, onSwipeLeftRepeat, onSwipeLeftDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const pointerState = useRef<PointerState | null>(null);

  const divider = isDivider(item);

  const dragTransform = transform ? CSS.Transform.toString(transform) : "";
  const style: CSSProperties = {
    transform: [dragTransform, translateX ? `translateX(${translateX}px)` : ""].filter(Boolean).join(" ") || undefined,
    transition: swiping ? "none" : transition,
  };

  function resetSwipe() {
    pointerState.current = null;
    setSwiping(false);
    setTranslateX(0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!divider) {
      pointerState.current = { startX: e.clientX, startY: e.clientY, pointerId: e.pointerId, axis: "none" };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 一部環境で setPointerCapture が失敗しても致命的ではないので無視する
      }
    }
    // dnd-kit の長押し判定（250ms）も同時に開始させる
    listeners?.onPointerDown?.(e);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (divider || !pointerState.current) return;
    if (isDragging) {
      // dnd-kit のドラッグが発火したらスワイプ側は諦めて位置を戻す
      resetSwipe();
      return;
    }
    const { startX, startY } = pointerState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (pointerState.current.axis === "none") {
      if (Math.abs(dx) > AXIS_LOCK_DISTANCE || Math.abs(dy) > AXIS_LOCK_DISTANCE) {
        pointerState.current.axis = Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO ? "x" : "y";
      }
    }
    if (pointerState.current.axis === "x") {
      setSwiping(true);
      setTranslateX(dx);
    }
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (divider || !pointerState.current) return;
    const { startX, startY, axis } = pointerState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    resetSwipe();

    if (isDragging) return; // ドラッグ確定後はスワイプを発火させない

    if (axis === "x" && Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      const actionItem = item as ActionItem;
      if (dx > 0) {
        onSwipeRight(actionItem.id);
      } else if (actionItem.isSingle) {
        onSwipeLeftDelete(actionItem);
      } else {
        onSwipeLeftRepeat(actionItem);
      }
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`row ${divider ? "row-divider" : "row-card"} ${isDragging ? "row-dragging" : ""}`}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {divider ? (
        <div className="divider-inner">
          <span className="divider-handle" aria-hidden="true">⋮⋮</span>
          <span className="divider-line" />
          <span className="divider-label">あとで</span>
          <span className="divider-line" />
        </div>
      ) : (
        <div className="card-inner">
          <span className="card-title">{(item as ActionItem).title}</span>
          {(item as ActionItem).isSingle && <span className="badge-single">単発</span>}
        </div>
      )}
    </div>
  );
}
