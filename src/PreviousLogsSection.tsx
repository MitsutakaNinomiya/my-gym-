import React from "react";

//PreviousLogsSectionコンポーネントが受け取る 1件分のlogの型
type PreviousLog = { 
    id: string,
    date: string,
    weight: number,
    reps: number,
    memo: string,
};

//Props(親から子に渡すデータのセット)の型
type PreviousLogsSectionProps = {
    part: string;
    exercise: string;
    latestDate: string;
    previousLogs: PreviousLog[];
};




//コンポーネント本体
export function PreviousLogsSection({
    part,
    exercise,
    latestDate,
    previousLogs,
}: PreviousLogsSectionProps) {
    return (
      <div className="text-sm text-slate-200 opacity-70 space-y-1">
        <div className="font-semibold">
            {part} {exercise} の前回の記録({latestDate}) :
        </div>
        
        <ul className="list-disc pl-5">
            {previousLogs.map((log,i)=> (
              <li key={log.id}>
                {i+1}セット目 : {log.weight}kg x {log.reps}回  メモ：{log.memo}
              </li>
            ))}

        </ul>
      </div>
    );
}