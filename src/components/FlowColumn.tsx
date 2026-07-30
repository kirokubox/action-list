import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FlowItem } from "../types";
import { FlowRow } from "./FlowRow";

type Props = {
  flow: FlowItem[];
  onReorder: (flow: FlowItem[]) => void;
  onRemove: (item: FlowItem) => void;
  onReset: () => void;
};

/**
 * 左列「今回の流れ」。純粋な一列の実行順で、時間帯の区切りは置かない。
 * 並べ替えはドラッグ、流れから外すのは横スワイプ。
 */
export function FlowColumn({ flow, onReorder, onRemove, onReset }: Props) {
  // 長押し（約250ms）でドラッグ発火。軽いタップ・縦スクロールでは発火しない。
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = flow.findIndex((item) => item.id === active.id);
    const newIndex = flow.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(flow, oldIndex, newIndex));
  }

  return (
    <section className="column column-flow" aria-label="今回の流れ">
      <div className="column-head">
        <h2 className="column-title">今回の流れ</h2>
        <button type="button" className="column-action" onClick={onReset} disabled={flow.length === 0}>
          新しい流れ
        </button>
      </div>

      <div className="column-body">
        {flow.length === 0 ? (
          <p className="empty-hint">
            右の定番メニューをタップして、
            <br />
            ここに順番を組み立てます
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flow.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {flow.map((item, index) => (
                <FlowRow key={item.id} item={item} order={index + 1} onRemove={onRemove} />
              ))}
            </SortableContext>
          </DndContext>
        )}
        {flow.length > 0 && <p className="column-note">長押しドラッグで並べ替え／横スワイプで流れから外す</p>}
      </div>
    </section>
  );
}
