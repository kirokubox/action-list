import { useEffect, useRef, useState } from "react";
import { FlowItem, MenuItem } from "./types";
import { load, save } from "./storage";
import { SAMPLE_MENU } from "./sampleMenu";
import { flowItemFromMenu, insertFlowAt, removeFlowItem, restoreFlowAt } from "./flowOps";
import {
  additiveMenuImport,
  appendMenuItem,
  extractMenuSource,
  newMenuItem,
  removeMenuItem,
  renameMenuItem,
  restoreMenuItemAt,
} from "./menuOps";
import { FlowColumn } from "./components/FlowColumn";
import { MenuColumn } from "./components/MenuColumn";
import { InsertPositionSheet } from "./components/InsertPositionSheet";
import { MenuEditSheet } from "./components/MenuEditSheet";
import { ConfirmSheet } from "./components/ConfirmSheet";
import { HeaderMenu } from "./components/HeaderMenu";
import { Snackbar } from "./components/Snackbar";

type ToastState = {
  id: number;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** 定番メニュー編集シートの状態。target=null は新規追加。 */
type EditState = { target: MenuItem | null };

function todayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [initial] = useState(load);
  const [menu, setMenu] = useState<MenuItem[]>(initial.menu);
  const [flow, setFlow] = useState<FlowItem[]>(initial.flow);

  const [editing, setEditing] = useState(false);
  const [pickTarget, setPickTarget] = useState<MenuItem | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    save(menu, flow);
  }, [menu, flow]);

  // v1（1列リスト＋区切り）から移行したときだけ、何が起きたかを一度だけ知らせる
  useEffect(() => {
    if (initial.migrated) {
      showToast("これまでの項目を右の定番メニューへ移しました", 6000);
    }
    // 初回マウント時だけ実行する（初期読み込み結果は再取得しない）
  }, []);

  function showToast(text: string, durationMs: number, actionLabel?: string, onAction?: () => void) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text, actionLabel, onAction });
    toastTimerRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, durationMs);
  }

  // ---- 右側 → 左側への追加 ----

  /** 定番メニューをタップ。流れが空なら位置を選ぶ必要がないのでそのまま追加する。 */
  function handlePick(item: MenuItem) {
    if (flow.length === 0) {
      setFlow([flowItemFromMenu(item)]);
      showToast(`「${item.title}」を追加しました`, 2500);
      return;
    }
    setPickTarget(item);
  }

  function handleInsertAt(index: number) {
    if (!pickTarget) return;
    setFlow((current) => insertFlowAt(current, flowItemFromMenu(pickTarget), index));
    setPickTarget(null);
  }

  // ---- 左側の操作 ----

  /** 横スワイプ＝今回の流れから外す。定番メニューには残る。 */
  function handleRemoveFromFlow(item: FlowItem) {
    const result = removeFlowItem(flow, item.id);
    if (!result) return;
    setFlow(result.flow);
    showToast(`「${result.removed.title}」を流れから外しました`, 5000, "元に戻す", () => {
      setFlow((current) => restoreFlowAt(current, result.removed, result.index));
    });
  }

  function handleResetFlow() {
    const previous = flow;
    setFlow([]);
    setResetConfirmOpen(false);
    showToast("今回の流れを空にしました", 5000, "元に戻す", () => setFlow(previous));
  }

  // ---- 定番メニューの管理 ----

  function handleSaveMenuItem(title: string) {
    if (!editState) return;
    if (editState.target) {
      setMenu((current) => renameMenuItem(current, editState.target!.id, title));
    } else {
      setMenu((current) => appendMenuItem(current, newMenuItem(title)));
    }
    setEditState(null);
  }

  function handleDeleteMenuItem() {
    const target = editState?.target;
    if (!target) return;
    const result = removeMenuItem(menu, target.id);
    setEditState(null);
    if (!result) return;
    setMenu(result.menu);
    showToast(`「${result.removed.title}」を定番から削除しました`, 5000, "元に戻す", () => {
      setMenu((current) => restoreMenuItemAt(current, result.removed, result.index));
    });
  }

  function handleAddSample() {
    const result = additiveMenuImport(menu, SAMPLE_MENU);
    setMenu(result.menu);
    showToast(
      result.addedCount === 0
        ? "追加できるサンプル項目はありませんでした"
        : `サンプル${result.addedCount}件を追加しました（同名${result.skippedCount}件はそのまま）`,
      4000,
    );
  }

  function handleExport() {
    const data = {
      app: "action-order",
      version: 2,
      exportedAt: new Date().toISOString(),
      menu,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-order-menu-${todayLocalDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** 追加型インポート。既存の定番メニューは消さない。v1バックアップ・旧シードJSONも受け付ける。 */
  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const source = extractMenuSource(JSON.parse(String(reader.result)));
        if (!source) {
          showToast("JSONの読み込みに失敗しました", 4000);
          return;
        }
        const result = additiveMenuImport(menu, source);
        setMenu(result.menu);
        showToast(`${result.addedCount}件追加しました（重複${result.skippedCount}件はスキップ）`, 4000);
      } catch {
        showToast("JSONの読み込みに失敗しました", 4000);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">action-order</h1>
        <button
          type="button"
          className="icon-button"
          onClick={() => setHeaderMenuOpen(true)}
          aria-label="メニューを開く"
        >
          ⋯
        </button>
      </header>

      <main className="columns">
        <FlowColumn
          flow={flow}
          onReorder={setFlow}
          onRemove={handleRemoveFromFlow}
          onReset={() => setResetConfirmOpen(true)}
        />
        <MenuColumn
          menu={menu}
          editing={editing}
          onToggleEditing={() => setEditing((current) => !current)}
          onPick={handlePick}
          onEdit={(item) => setEditState({ target: item })}
          onAdd={() => setEditState({ target: null })}
          onReorder={setMenu}
        />
      </main>

      {pickTarget && (
        <InsertPositionSheet
          title={pickTarget.title}
          flow={flow}
          onSelect={handleInsertAt}
          onClose={() => setPickTarget(null)}
        />
      )}
      {editState && (
        <MenuEditSheet
          target={editState.target}
          onSave={handleSaveMenuItem}
          onDelete={editState.target ? handleDeleteMenuItem : undefined}
          onClose={() => setEditState(null)}
        />
      )}
      {resetConfirmOpen && (
        <ConfirmSheet
          title="今回の流れを空にします"
          body="右の定番メニューは消えません。"
          confirmLabel="空にする"
          onConfirm={handleResetFlow}
          onClose={() => setResetConfirmOpen(false)}
        />
      )}
      {headerMenuOpen && (
        <HeaderMenu
          onAddSample={handleAddSample}
          onExport={handleExport}
          onImportFile={handleImportFile}
          onClose={() => setHeaderMenuOpen(false)}
        />
      )}
      {toast && (
        <div className="snackbar-wrap">
          <Snackbar text={toast.text} actionLabel={toast.actionLabel} onAction={toast.onAction} />
        </div>
      )}
    </div>
  );
}
