import { useState, useEffect } from "react";

// ------------ 型定義（TypeScriptの型） ------------

// トレーニングログの型
type Log = {
  id: string;
  part: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  text: string;
  memo: string;
};


// ------------ 定数 ------------


// 部位ごとの種目リスト
const EXERCISES_BY_PART: Record<string, string[]> = {
  胸: ["ベンチプレス", "ダンベルフライ", "スミスベンチプレス"],
  背中: ["ラットプルダウン", "ベントオーバーローイング", "デッドリフト"],
  肩: ["サイドレイズ", "ショルダープレス", "ケーブルサイドレイズ"],
  脚: ["スクワット","レッグプレス", "レッグカール"],
  腕: ["ライイングエクステンション", "ダンベルカール", "ケーブルプレスダウン"],
}


// ランダムなIDを生成する関数 もしcryptoがundefinedでなく、かつcryptoオブジェクトにrandomUUIDメソッドがあればtrue
const createId = () => { 
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) { //typeof crypto === "object" && "randomUUID" in crypto でも正しく見えるし、実際多くの環境でも動くが、厳密にはcryptoがnullやfunctionの場合があるため、typeof crypto !== "undefined"の方が安全
    return crypto.randomUUID(); // UUIDを生成
  }
  // UUID非対応環境向けのフォールバック
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};


// ------------ メインコンポーネント ------------
export default function App() {
  // 入力欄の状態管理
  const [part, setPart] = useState(""); //部位
  const [exercise, setExercise] = useState(""); //種目
  const [weight, setWeight] = useState(""); //重量
  const [reps, setReps] = useState(""); //回数
  const [memo, setMemo] = useState(""); //メモ

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<string>(() => // 初期値を今日の日付にする
    new Date().toISOString().slice(0, 10) // アロー関数が一行の場合、波括弧とreturnは省略可能 setLogs()
  );



  //  Log型の配列として定義
  const [logs, setLogs] = useState<Log[]>([]); // ログの配列を保持する  ※setLogs→logs の順で実行される訳ではない。set〇〇はあくまでreactにリクエストするだけ

  const [editingId, setEditingId] = useState<string | null>(null); // IDは文字列型なのでstring | nullは何かというと、文字列かnullのどちらかの型を持つことを意味する    (null)は初期値
  // const [editText, setEditText] = useState(""); // 編集用テキスト
  const [editWeight, setEditWeight] = useState(""); // 編集用重量 
  const [editReps, setEditReps] = useState(""); // 編集用回数 保存するときにNumber()で数値に変換する ※何故ならinputのvalueは文字列型だから
  const [editMemo, setEditMemo] = useState("");



  // アプリ起動時に localStorage から保存したログを読み込む
  useEffect(() => {
    const saved = localStorage.getItem("logs"); // 保存された文字列を取り出す
    if (saved) {
      setLogs(JSON.parse(saved)); // 文字列を配列に変換して状態にセット
    }
  }, []); // 空の依存配列なので、最初の一回だけ実行される



  // ログを追加する関数
  const addLog = () => {
    const p = part.trim();
    const e = exercise.trim();
    const w = weight.trim();
    const r = reps.trim();
    const m = memo.trim();

  // どれか一つでも空文字なら何もしない 
  if(!p || !e || !w || !r ) return;   //mはそもそも合っても無くてもいいので if条件に入れくても良い

  // 「胸 ベンチプレス 70kg × 10回」みたいな文字列を作る
  const t = `${p} ${e} ${w}kg x ${r}回 ${m}`; 

  //新しいログオブジェクト
  const newLog: Log = {
    id: createId(), 
    part: p, // string(p)に変換不要、なぜならpはもともとstring型だから
    exercise: e, 
    weight: Number(w), //文字列を数値に変換 
    reps: Number(r), 
    date: selectedDate, // 選択中の日付で保存
    text: t,
    memo: m,
  }



    // logs配列に新しいログを追加する
    setLogs((prevLogs) => {  
      const newLogs = [...prevLogs, newLog]; // 新しい配列を作成
      localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映
      return newLogs; // 新しい配列を返す
    });

    // 入力欄を空にする
    // setPart("");
    // setExercise("");
    
    setWeight("");
    setReps("");
    setMemo("");
  };




    // 編集を開始する関数
  const startEdit = (log: Log) => {
    setEditingId(log.id); // 編集対象のIDをセット
    setEditWeight(String(log.weight)); //文字列にしてset
    setEditReps(String(log.reps)); 
    setEditMemo(String(log.memo)); 
  };




  // 編集内容を保存する関数
  const updateLog = () => {
    if (!editingId) return; // 編集対象がないなら何もしない

    const w =editWeight.trim();
    const r =editReps.trim();
    const m =editMemo.trim();


    if(!w || !r) return; // 空文字なら何もしない

    // w と r を数値に変換
    const weightNum = Number(w);
    const repsNum = Number(r);

    // 数値変換に失敗したら何もせずに終了 isNaNは数値かどうかを判定するメソッド
    if (Number.isNaN(weightNum) || Number.isNaN(repsNum)) {  
      return alert("重量と回数には有効な数字を入力してください"); // 数字に変換できなかった場合、アラートを表示して終了
    } 

    // logs配列の該当する行を更新する
    setLogs((prevLogs) => { 
      const newLogs = prevLogs.map((log) => {
        if (log.id !== editingId) return log; // 編集対象でなければそのまま返す 

        // 編集対象のログを更新
        const updateText = `${log.part} ${log.exercise} ${weightNum}kg x ${repsNum}回 ${m}` ;
        return {
          ...log, // logのオブジェクトを展開し、↓の要素だけを更新
          weight: weightNum, 
          reps: repsNum,   
          memo: m,
          text: updateText, 
        };
      });
        
     
  
     localStorage.setItem("logs", JSON.stringify(newLogs));
     return newLogs;
    });


    setEditingId(null); // 編集対象なしに戻す
    setEditWeight(""); 
    setEditReps(""); 
    setEditMemo("");
  };







  // 指定したlogを削除する関数
  const handleDelete = (id: string) => {  

// filter：条件に合うものだけ残して新しい配列を作る
    setLogs((prevLogs) => {
      const newLogs = prevLogs.filter((log) => log.id !== id);// filter:条件に合うものだけ[残して],新しい配列を作る

      localStorage.setItem("logs", JSON.stringify(newLogs));
      return newLogs; 
    });
  };


    // "YYYY-MM-DD" → "YYYY/M/D" に変換して表示用にする
  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return ""; // isoDateが空白なら 何も返さない

    const [y ,m ,d] = isoDate.split("-"); // YYYY-MM-DD を - で分割して配列にする
    return `${y}/${Number(m)}/${Number(d)}`; // 
  };


  // 選択中の日付のログだけ抽出
  const filteredLogs = logs.filter((log) => log.date === selectedDate);



    // ✅ 選択中の「部位＋種目」の“前回の1日分（全セット）”を取得
  const previousLogsForSelection: Log[] = (() => { 

    // 部位 or 種目がまだ選ばれていなければ前回は出さない
    if (!part || !exercise) return [];

    // ① 同じ部位・種目で、かつ「選択中の日付より前」のログだけに絞る
    const sameExerciseOldLogs = logs.filter(
      (log) =>
        log.part === part &&         //log.partは過去のログの部位、partは選択中の部位
        log.exercise === exercise &&
        log.date < selectedDate // ← ここがポイント！「その日より前」
    );

    if (sameExerciseOldLogs.length === 0) return [];

    // ② その中で「一番新しい日付（＝最後の1日）」を探す
    //    ISO形式(YYYY-MM-DD)は文字列比較でも「後ろのほうが新しい日」になる
    let latestDate = sameExerciseOldLogs[0].date; 
    for (const log of sameExerciseOldLogs) {
      if (log.date > latestDate) {
        latestDate = log.date; // より新しい日付があれば更新
      }
    }

    // ③ その「最後の日付」のログだけを前回記録として返す
    return sameExerciseOldLogs.filter((log) => log.date === latestDate);
  })(); // 即時実行関数




















// ------------ 画面表示 ------------
















    return (

      // サイト全体のコンテナ
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">

     {/* アプリ全体の“カード”コンテナ */}
      <div className="w-full max-w-3xl my-4 sm:my-0 space-y-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">




      {/* 🗓 カレンダーエリア（このアプリの“入口”） */}
      <section className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-400">トレーニングする日を選択</p>
            <p className="text-sm text-slate-200 mt-1">
              現在：
              <span className="font-semibold">
                {formatDisplayDate(selectedDate)} 
              </span>
              の記録を表示中
            </p>
          </div>

          {/* 日付（カレンダー）入力 */}
          <input
            type="date" // ← カレンダーUI
            value={selectedDate} //選択中の日付
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm sm:text-base text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </section>





      {/* 入力エリア全体（横並び） */}
      <div className="flex flex-wrap items-center gap-3">

        {/* 部位セレクトボックス */}
        <select
          value={part}
          onChange={(e) => {
            const newPart = e.target.value;
            setPart(newPart);
            setExercise("");
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
            (EXERCISES_BY_PART[part] ?? []).map((name) => (
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
              if (e.key === "Enter") addLog();
            }}
            placeholder="回数"
            type="number"
            className="w-20 rounded-lg border border-white bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2  focus:ring-sky-500 focus:border-sky-500"
          />
          <span className="text-sm text-slate-200">回</span>
        </div>


            {/*メモ入力欄 */}
        <div className="flex items-center gap-1">
          <input 
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === "Enter") addLog();
            }}
            placeholder="メモ"
            type="text"
            className="rounded-lg border border-white px-2 py-1 text-sm  text-slate-100 focus:ring-sky-500 focus:border-sky-500"
            />
        </div>



        {/* 追加ボタン */}
        <button
          onClick={addLog}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 active:bg-sky-700 transition disabled:opacity-50 "
        >
          追加
        </button>
      </div>

              {/* 前回の記録表示（前回の1日分の全セット） */}
      {part && exercise && previousLogsForSelection.length > 0 && (
        <div className="text-sm text-slate-200 space-y-1">
          <div className="font-semibold">
            前回の記録（
            {formatDisplayDate(previousLogsForSelection[0].date)}
            ）：
          </div>
          <ul className="list-disc pl-5">
            {previousLogsForSelection.map((log, i) => (
              <li key={log.id}>
                {i + 1}セット目：{log.weight}kg × {log.reps}回
              </li>
            ))}
          </ul>
        </div>
      )}




      <h2 className="text-lg font-semibold text-slate-100 mb-2">
        {formatDisplayDate(selectedDate)} の記録
      </h2>


      {/* ログ一覧 */}
      <ul className="space-y-2">
        
        {filteredLogs.map((log, index) => (
            <li
            key={log.id} // ← id を key にするとReact的にベスト
            className="flex flex-wrap items-center gap-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2"
          >

            
            {editingId === log.id ? ( 
                // ✏️ 編集モードの行
              <>
               {/* 左側：部位＋種目は固定表示 */}
               <div className="w-full text-sm text-slate-200 font-semibold">
                {log.part} {log.exercise}
               </div>




                {/* 重量編集用 */}
                <div className="flex items-center gap-4 w-full mt-1">
                  <input
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === "Enter") updateLog();
                    }}
                    type="number" 
                    className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-300">kg</span>
                </div>


                {/* 回数編集用 */}
                <div className="flex items-center gap-4 w-full mt-1">
                  <input 
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === "Enter") updateLog();
                    }}
                    type="number"
                    className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    
                    <span className="text-xs text-slate-300">回</span>
                </div>

                {/* memo編集用 */}
                <div>
                  <input
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === "Enter") updateLog();
                    }}
                    type="text"
                    className="rounded-lg border border-white px-2 py-1 text-sm  text-slate-100 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                

                
                
                <button
                  onClick={updateLog}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700 transition"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditWeight("");
                    setEditReps("");
                  }}
                  className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 active:bg-slate-800 transition"
                >
                  戻る
                </button>
              </>




            ) : (




              //デフォルト表示画面
              <>
                <span className="flex-1 text-sm text-slate-100">
                  {index + 1} . 
                   {log.text}
                </span>

                <button
                  onClick={() => startEdit(log)}
                  className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 active:bg-amber-700 transition"
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(log.id)}
                  className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 active:bg-rose-700 transition"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
       </div>
    </div>
  );
}
