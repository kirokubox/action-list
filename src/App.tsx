import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ActionItem, ListItem } from "./types";
import { loadItems, saveItems } from "./storage";
import {
  additiveImport,
  insertAboveDivider,
  insertBelowDivider,
  moveAboveDivider,
  removeWithIndex,
  reorderAll,
  restoreAt,
} from "./listOps";
import { notifyRepeatCompleted } from "./repeatHook";
import { SortableRow } from "./components/SortableRow";
import { AddForm } from "./components/AddForm";
import { MenuPanel } from "./components/MenuPanel";
import { Snackbar } from "./components/Snackbar";

type ToastState = {
  id: number;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

function todayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [items, setItems] = useState<ListItem[]>(() => loadItems());
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);

  // 長押し（約250ms）でドラッグ発火。軽いタップ・スクロールでは発火しない。
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  useEffect(() => {
    saveItems(items);
  }, [items]);

  function showToast(text: string, durationMs: number, actionLabel?: string, onAction?: () => void) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text, actionLabel, onAction });
    toastTimerRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, durationMs);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return reorderAll(arrayMove(prev, oldIndex, newIndex));
    });
  }

  // 右スワイプ（全項目）＝ スキップ：区切りの直上（「これから」ゾーン最下部）へ移動
  function handleSwipeRight(id: string) {
    setItems(moveAboveDivider(items, id));
  }

  // 左スワイプ（繰り返し項目）：区切りの直下へ挿入し、将来のかぞえ帳連携フックを経由させる
  function handleSwipeLeftRepeat(item: ActionItem) {
    setItems(insertBelowDivider(items, item.id));
    notifyRepeatCompleted(item);
  }

  // 左スワイプ（単発項目）＝ 削除＋アンドゥ
  function handleSwipeLeftDelete(item: ActionItem) {
    const result = removeWithIndex(items, item.id);
    if (!result) return;
    const { removed, index } = result;
    setItems(result.items);
    showToast(`「${removed.title}」を削除しました`, 5000, "元に戻す", () => {
      setItems((current) => restoreAt(current, removed, index));
    });
  }

  function handleAdd(title: string, isSingle: boolean) {
    const newItem: ActionItem = { id: crypto.randomUUID(), title, isSingle };
    setItems(insertAboveDivider(items, newItem));
    setAddOpen(false);
  }

  function handleExport() {
    const data = {
      app: "action-list",
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-list-backup-${todayLocalDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const rawItems = Array.isArray(parsed?.items) ? parsed.items : null;
        if (!rawItems) {
          showToast("JSONの読み込みに失敗しました", 4000);
          return;
        }
        const result = additiveImport(items, rawItems);
        setItems(result.items);
        showToast(`${result.addedCount}件追加しました（重複${result.skippedCount}件はスキップ）`, 4000);
      } catch {
        showToast("JSONの読み込みに失敗しました", 4000);
      }
    };
    reader.readAsText(file);
  }

  const isEmpty = items.length === 1;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">action-order</h1>
        <button
          type="button"
          className="icon-button"
          onClick={() => setMenuOpen(true)}
          aria-label="メニューを開く"
        >
          ⋯
        </button>
      </header>

      <main className="list-container">
        {isEmpty && (
          <p className="empty-hint">右上メニューからJSONを取り込むか、＋で項目を追加してください</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                onSwipeRight={handleSwipeRight}
                onSwipeLeftRepeat={handleSwipeLeftRepeat}
                onSwipeLeftDelete={handleSwipeLeftDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      <button type="button" className="fab-add" onClick={() => setAddOpen(true)}>
        ＋ 追加
      </button>

      {addOpen && <AddForm onAdd={handleAdd} onClose={() => setAddOpen(false)} />}
      {menuOpen && (
        <MenuPanel onExport={handleExport} onImportFile={handleImportFile} onClose={() => setMenuOpen(false)} />
      )}
      {toast && (
        <div className="snackbar-wrap">
          <Snackbar text={toast.text} actionLabel={toast.actionLabel} onAction={toast.onAction} />
        </div>
      )}
    </div>
  );
}
