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

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<string>(() => 
    new Date().toISOString().slice(0, 10) // アロー関数が一行の場合、波括弧とreturnは省略可能 
  );



  //  Log型の配列として定義
  const [logs, setLogs] = useState<Log[]>([]); // ログの配列を保持する  ※setLogs→logs の順で実行される訳ではない。set〇〇はあくまでreactにリクエストするだけ

  const [editIndex, setEditIndex] = useState<number | null>(null); // 編集中の行番号（なければ null）
  const [editText, setEditText] = useState(""); // 編集用テキスト



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

    // どれか一つでも空文字なら何もしない
    if(!p || !e || !w || !r) return; 

    // 「胸 ベンチプレス 70kg × 10回」みたいな文字列を作る
  const t = `${p} ${e} ${w}kg x ${r}回`; 

  //新しいログオブジェクト
  const newLog: Log = {
    id: createId(), 
    part: p, // string(p)に変換不要、なぜならpはもともとstring型だから
    exercise: e, 
    weight: Number(w), //文字列を数値に変換 
    reps: Number(r), 
    date: selectedDate, // 選択中の日付で保存
    text: t,
  }



    // logs配列に新しいログを追加する
    setLogs((prevLogs) => {  
      const newLogs = [...prevLogs, newLog]; // 新しい配列を作成
      localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映
      return newLogs; // 新しい配列を返す
    });

    // 入力欄を空にする
    setPart("");
    setExercise("");
    setWeight("");
    setReps("");
  };



  // 編集内容を保存する関数（Update：更新）
  const updateLog = () => {
    if (editIndex === null) return; // 編集対象がない（null）なら何もしない

    const t = editText.trim(); // 前後の空白を削除
    if (!t) return; // 空文字なら何もしない

    // logs配列の該当する行を更新する
    setLogs((prevLogs) => { 
      const newLogs = prevLogs.map((log, index) => 
        index === editIndex
         ? {...log, text:t } : log
     );
     
    //JSON.stringifyで文字列に変換しローカルストレージに保存
     localStorage. setItem("logs", JSON.stringify(newLogs));
     return newLogs;
    });

    // 編集モードを終了
    setEditIndex(null);
    setEditText("");
  };



  // 編集を開始する関数
  const startEdit = (index: number, log: Log) => {
    setEditIndex(index); // 編集したい行番号を状態に保存
    setEditText(log.text);    // 編集用テキストの初期値として log を入れる
  };



  // 指定した index のログを削除する関数 
  const handleDelete = (index: number) => {   // returnが無い為、戻り値の型付けは不要 :void(省略可)

// filter：条件に合うものだけ残して新しい配列を作る
    setLogs((prevLogs) => { 
      const newLogs = prevLogs.filter((_, i) => i !== index);// filter:条件に合うものだけ[残して],新しい配列を作る

      localStorage.setItem("logs", JSON.stringify(newLogs));
      return newLogs;
    })
    //const newLogs = logs.filter((_, i) => i !== index); // ↑最新の書き方
    //setLogs(newLogs);
    //localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映
  };

    // "YYYY-MM-DD" → "YYYY/M/D" に変換して表示用にする
  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return ""; // isoDateが空白なら 何も返さない

    const [y ,m ,d] = isoDate.split("-"); // YYYY-MM-DD を - で分割して配列にする
    return `${y}/${Number(m)}/${Number(d)}`; // 
  };


  // 
  const filteredLogs = logs.filter((log) => log.date === selectedDate); // 選択中の日付のログだけ抽出

















// ------------ 画面表示 ------------


















    return (

      // サイト全体のコンテナ
    <div className="space-y-4">

      {/* 日付（カレンダー）入力 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-100">日付：</span>
        <input
          type="date" // ← カレンダーUI
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

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
          className="rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
            className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none  focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
            className="w-20 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2  focus:ring-sky-500 focus:border-sky-500"
          />
          <span className="text-sm text-slate-200">回</span>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={addLog}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 active:bg-sky-700 transition disabled:opacity-50 "
        >
          追加
        </button>
      </div>



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

            {editIndex === index ? (
              // ✅ 編集中の行
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateLog();
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-500 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  onClick={updateLog}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 active:bg-emerald-700 transition"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditIndex(null);
                    setEditText("");
                  }}
                  className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 active:bg-slate-800 transition"
                >
                  戻る
                </button>
              </>
            ) : (
              // ✅ 通常表示の行
              <>
                <span className="flex-1 text-sm text-slate-100">
                  {index + 1} . 
                   {log.text}
                </span>

                <button
                  onClick={() => startEdit(index, log)}
                  className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 active:bg-amber-700 transition"
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(index)}
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
  );
}
