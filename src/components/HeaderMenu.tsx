import { useRef, type ChangeEvent } from "react";

type Props = {
  onAddSample: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onClose: () => void;
};

/** ヘッダー右の「⋯」メニュー。定番メニューのサンプル追加とJSONの取り込み・書き出し。 */
export function HeaderMenu({ onAddSample, onExport, onImportFile, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = ""; // 同じファイルを続けて選び直せるようにリセット
    onClose();
  }

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onAddSample();
            onClose();
          }}
        >
          サンプルメニューを追加
        </button>
        <button type="button" className="menu-item" onClick={() => fileInputRef.current?.click()}>
          定番メニューを取り込む
        </button>
        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onExport();
            onClose();
          }}
        >
          定番メニューを書き出す
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden-file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
