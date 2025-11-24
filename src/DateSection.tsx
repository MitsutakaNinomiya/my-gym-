// DateSection.tsx
import React from "react";

//カレンダー部分をコンポーネントに分割

// Props（プロップス） = 親コンポーネント(App) から受け取る「引数」の型
type DateSectionProps = {
  selectedDate: string;                // 選択中の日付 (YYYY-MM-DD)
  displayDate: string;                 // 表示用の日付 (YYYY/M/D)
  onChangeDate: (value: string) => void; // 日付が変わったときに呼ぶ関数
};

export function DateSection({
  selectedDate,
  displayDate,
  onChangeDate,
}: DateSectionProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">トレーニングする日を選択</p>
          <p className="text-sm text-slate-200 mt-1">
            現在：
            <span className="font-semibold">{displayDate}</span>の記録を表示中
          </p>
        </div>

        {/* 日付（カレンダー）入力 */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChangeDate(e.target.value)}
          className="rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm sm:text-base text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
    </section>
  );
}
