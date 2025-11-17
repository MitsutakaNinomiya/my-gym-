import { useState, useEffect } from "react";

export default function App() {
  const [part, setPart] = useState(""); //部位
  const [exercise, setExercise] = useState(""); //種目
  const [weight, setWeight] = useState(""); //重量
  const [reps, setReps] = useState(""); //回数

  const [logs, setLogs] = useState<string[]>([]); // ログの配列を保持する  ※setLogs→logs の順で実行される訳ではない。set〇〇はあくまでreactにリクエストするだけ

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

    // logs配列に新しいログ追加
    setLogs((prevLogs) => {  
      const newLogs = [...prevLogs, t];
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

    const t = editText.trim();
    if (!t) return; // 空文字なら何もしない

    setLogs((prevLogs) => { 
      const newLogs = prevLogs.map((log, index) => 
        index === editIndex ? t : log
     );
     //const newLogs = logs.map((log, index) => //↑最新の書き方
      //index === editIndex ? t : log
    //);

     localStorage. setItem("logs", JSON.stringify(newLogs));
     return newLogs;
    });
    

    setLogs(newLogs); // 状態を更新
    localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映

    // 編集モードを終了
    setEditIndex(null);
    setEditText("");
  };



  // 編集を開始する関数
  const startEdit = (index: number, log: string) => {
    setEditIndex(index); // 編集したい行番号を状態に保存
    setEditText(log);    // 編集用テキストの初期値として log を入れる
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












  return (
    <div style={{  display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>

    {/* 部位セレクトボックス */}
      <select
        value={part}  //選択された部位をvalueに反映
        onChange={(e) => setPart(e.target.value)} //選択された部位をstateにset
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
      >
        <option value="">種目を選択</option>
        <option value="ベンチプレス">ベンチプレス</option>
        <option value="サイドレイズ">サイドレイズ</option>
        <option value="ラットプルダウン">ラットプルダウン</option>
        <option value="ライイングエクステンション">ライイングエクステンション</option>
        <option value="ダンベルカール">ダンベルカール</option>
        <option value="スクワット">スクワット</option>      
        
      </select>
      


      {/* 重量入力欄 */}
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <input
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="重量"
        type="number"
        style={{ width: "70px" }}
      />
      <span>kg</span>
    </div>


      {/* 回数入力欄 */}
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addLog(); // Enterで追加
          }}
          placeholder="回数"
          type="number"
          style={{ width: "70px" }}
        />
        <span>回</span>
      </div>
      
      <button onClick={addLog}>追加</button>
      
      
      


      <ul>
        {logs.map((log, index) => (

          <li
            key={index}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >

          {editIndex === index ? (


        // ✅ ここが「編集中の行」の表示
        <>
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateLog(); 
            }
          }}
        />
          <button onClick={updateLog}>保存</button>
          <button onClick={() => {
            setEditIndex(null);
            setEditText("");
          }}>
            戻る
          </button>
        </>

        ) : (
        // ✅ ここが「ふつうの行」の表示
        <>
          <span>{index + 1}. {log}</span>

          {/* 編集ボタン */}
          <button onClick={() => startEdit(index, log)}>編集</button>

          {/* 削除ボタン */}
          <button onClick={() => handleDelete(index)}>削除</button>
        </>
      )}
    </li>
  ))}
</ul>

    </div>
  );
}
