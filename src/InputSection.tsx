

type InputSectionProps = { 

    //状態を変えるための関数たち
    part: string;
    setPart: (value: string) => void; //文字列を１つ受け取り、何も返さない関数(void)

    exercise: string;
    setExercise: (value: string) => void;

    weight: string;
    setWeight: (value: string) => void;

    reps: string;
    setReps: (value: string) => void;

    memo: string;
    setMemo: (value: string) => void;




    //部位ごとの種目リスト
    exercisesByPart: Record<string, string[]>;

    //追加ボタンを押したときの処理
    onAddLog: () => void;


};


//コンポーネント本体
export function InputSection({
    part, 
    setPart,
    exercise,
    setExercise,
    weight,
    setWeight,
    reps,
    setReps,
    memo,
    setMemo,
    exercisesByPart,
    onAddLog,

}: InputSectionProps) { 
    return (
 // 入力エリア全体（横並び）
    <div className="flex flex-wrap items-center gap-3">
      {/* 部位セレクトボックス */}
      <select
        value={part}
        onChange={(e) => {
          const newPart = e.target.value;
          setPart(newPart);   // 親の part を更新
          setExercise("");    // 部位が変わったら種目をリセット
        }}
        className="rounded-lg border border-white bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      >
        <option value="">- -部位- -</option>
        <option value="胸">胸</option>
        <option value="背中">背中</option>
        <option value="肩">肩</option>
        <option value="脚">脚</option>
        <option value="腕">腕</option>
      </select>

      {/* 種目セレクトボックス */}
      <select
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        disabled={!part}
        className="rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">
          {part ? "種目を選択" : "先に部位を選択してください"}
        </option>

        {part &&
          (exercisesByPart[part] ?? []).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
      </select>

      {/* 重量入力欄 */}
      <div className="flex items-center gap-1">
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="重量"
          type="number"
          className="w-20 rounded-lg border border-white bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none  focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
        <span className="text-sm text-slate-200">kg</span>
      </div>

      {/* 回数入力欄 */}
      <div className="flex items-center gap-1">
        <input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddLog();
          }}
          placeholder="回数"
          type="number"
          className="w-20 rounded-lg border border-white bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2  focus:ring-sky-500 focus:border-sky-500"
        />
        <span className="text-sm text-slate-200">回</span>
      </div>

      {/* メモ入力欄 */}
      <div className="flex items-center gap-1">
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddLog();
          }}
          placeholder="メモ"
          type="text"
          className="rounded-lg border border-white px-2 py-1 text-sm  text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* 追加ボタン */}
      <button
        onClick={onAddLog}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 active:bg-sky-700 transition disabled:opacity-50 "
      >
        追加
      </button>
    </div>
    );
}






// **React の <input> が返す値 (e.target.value) は、どんな入力欄でも必ず “string（文字列）” になる。**




//setPartみたいな「状態を更新するだけの関数」は何も返さないのが普通だから、返り値は void。