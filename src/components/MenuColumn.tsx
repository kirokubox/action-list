import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MenuItem } from "../types";
import { MenuRow } from "./MenuRow";

type Props = {
  menu: MenuItem[];
  editing: boolean;
  onToggleEditing: () => void;
  onPick: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onAdd: () => void;
  onReorder: (menu: MenuItem[]) => void;
};

/**
 * 右列「定番メニュー」。件数が多くなるためコンパクトな行表示にしている。
 * 通常モードはタップ＝今回の流れへ追加、編集モードはタップ＝名称編集／長押しドラッグ＝並べ替え。
 */
export function MenuColumn({ menu, editing, onToggleEditing, onPick, onEdit, onAdd, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = menu.findIndex((item) => item.id === active.id);
    const newIndex = menu.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(menu, oldIndex, newIndex));
  }

  return (
    <section className="column column-menu" aria-label="定番メニュー">
      <div className="column-head">
        <h2 className="column-title">定番</h2>
        <button
          type="button"
          className={`column-action ${editing ? "column-action-on" : ""}`}
          onClick={onToggleEditing}
        >
          {editing ? "終わる" : "編集"}
        </button>
      </div>

      <div className="column-body">
        {menu.length === 0 && <p className="empty-hint">＋ から定番を追加してください</p>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={menu.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {menu.map((item) => (
              <MenuRow key={item.id} item={item} editing={editing} onPick={onPick} onEdit={onEdit} />
            ))}
          </SortableContext>
        </DndContext>

        <button type="button" className="menu-add-row" onClick={onAdd}>
          ＋ 定番を追加
        </button>
        {editing && <p className="column-note">タップで名称編集／長押しドラッグで並べ替え</p>}
      </div>
    </section>
  );
}
