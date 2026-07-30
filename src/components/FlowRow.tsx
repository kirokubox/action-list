import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FlowItem } from "../types";

// スワイプの発火しきい値。横移動が約72px以上、かつ |dx| > |dy|×1.5 のときだけ発火する。
const SWIPE_THRESHOLD = 72;
const SWIPE_RATIO = 1.5;
// この距離を超えて動くまでは「横スワイプか縦スクロールか」を判定しない（軽いタップ対策）
const AXIS_LOCK_DISTANCE = 10;

type Props = {
  item: FlowItem;
  order: number;
  onRemove: (item: FlowItem) => void;
};

type PointerState = {
  startX: number;
  startY: number;
  axis: "none" | "x" | "y";
};

/**
 * 左側「今回の流れ」1行。
 * - 長押し（約250ms）ドラッグで並べ替え（dnd-kit）
 * - 左右どちらの横スワイプでも「今回の流れから外す」（定番メニューには残る）
 *
 * スワイプに「末尾へ送る」等の便利機能は持たせない。便利すぎるとドラッグを使わなくなり、
 * 並べ替えアプリとしての本体操作が使われなくなることを実利用で確認しているため。
 */
export function FlowRow({ item, order, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const pointerState = useRef<PointerState | null>(null);

  const dragTransform = transform ? CSS.Transform.toString(transform) : "";
  const swipeProgress = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);
  const style: CSSProperties = {
    transform: [dragTransform, translateX ? `translateX(${translateX}px)` : ""].filter(Boolean).join(" ") || undefined,
    transition: swiping ? "none" : transition,
    opacity: swiping ? 1 - swipeProgress * 0.45 : undefined,
  };

  function resetSwipe() {
    pointerState.current = null;
    setSwiping(false);
    setTranslateX(0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    pointerState.current = { startX: e.clientX, startY: e.clientY, axis: "none" };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 一部環境で setPointerCapture が失敗しても致命的ではないので無視する
    }
    // dnd-kit の長押し判定（250ms）も同時に開始させる
    listeners?.onPointerDown?.(e);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerState.current) return;
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
    if (!pointerState.current) return;
    const { startX, startY, axis } = pointerState.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    resetSwipe();

    if (isDragging) return; // ドラッグ確定後はスワイプを発火させない

    if (axis === "x" && Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      onRemove(item);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flow-row ${isDragging ? "flow-row-dragging" : ""}`}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <span className="flow-order" aria-hidden="true">
        {order}
      </span>
      <span className="flow-title">{item.title}</span>
    </div>
  );
}
