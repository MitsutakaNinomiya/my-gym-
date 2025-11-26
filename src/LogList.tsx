import type { Log } from "./App";

type LogListProps = {

    logs: Log[];     // 選択中の日付のログ一覧
    editingId: string| null;  // 今編集中のログのid（なければnull）
    editWeight: string;
    editReps: string;
    editMemo: string;
    onChangeEditWeight: (value: string) => void;  //editWeightが変更されたときに実行される 
    onChangeEditReps: (value: string) => void;
    onChangeEditMemo: (value: string) => void;
    onUpdateLog: () => void;
    onCancelEdit: () => void;
    onStartEdit: (log: Log) => void;
    onDelete: (id: string) => void;
};


export function LogList(props: LogListProps) {
    const {
    logs,
    editingId,
    editWeight,
    editReps,
    editMemo,
    onChangeEditWeight,
    onChangeEditReps,
    onChangeEditMemo,
    onUpdateLog,
    onCancelEdit,
    onStartEdit,
    onDelete,
    } = props;

    return(
<ul className="space-y-2">
      {logs.map((log, index) => (
        <li
          key={log.id}
          className="flex flex-wrap items-center gap-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2"
        >
          {editingId === log.id ? (
            <>
              {/* 編集モード*/}
              <div className="w-full text-sm text-slate-200 font-semibold">
                {log.part} {log.exercise}
              </div>

              <div className="flex items-center gap-4 w-full mt-1">
                <input
                  value={editWeight}
                  onChange={(e) => onChangeEditWeight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onUpdateLog();
                  }}
                  type="number"
                  className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <span className="text-xs text-slate-300">kg</span>
              </div>

              <div className="flex items-center gap-4 w-full mt-1">
                <input
                  value={editReps}
                  onChange={(e) => onChangeEditReps(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onUpdateLog();
                  }}
                  type="number"
                  className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <span className="text-xs text-slate-300">回</span>
              </div>

              <div>
                <input
                  value={editMemo}
                  onChange={(e) => onChangeEditMemo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onUpdateLog();
                  }}
                  type="text"
                  className="rounded-lg border border-white px-2 py-1 text-sm  text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <button
                onClick={onUpdateLog}
                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700 transition"
              >
                保存
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 active:bg-slate-800 transition"
              >
                戻る
              </button>
            </>
          ) : (
            <>
              {/* 通常モード */}
              <span className="flex-1 text-sm text-slate-100">
                {index + 1}. {log.text}
              </span>

              <button
                onClick={() => onStartEdit(log)}
                className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 active:bg-amber-700 transition"
              >
                編集
              </button>

              <button
                onClick={() => onDelete(log.id)}
                className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 active:bg-rose-700 transition"
              >
                削除
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
    )
}