import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState(""); // 入力された文字列を保持する（追加用）
  const [logs, setLogs] = useState<string[]>([]); // ログの配列を保持する  ※setLogs→logs の順で実行される訳ではない。set〇〇はあくまでreactにリクエストするだけ

  const [editIndex, setEditIndex] = useState<number | null>(null); // 編集中の行番号（なければ null）
  const [editText, setEditText] = useState(""); // 編集用テキスト



  // アプリ起動時に localStorage から保存したログを読み込む
  useEffect(() => {
    const saved = localStorage.getItem("logs"); // 保存された文字列を取り出す
    if (saved) {
      setLogs(JSON.parse(saved)); // 文字列を配列に変換する
    }
  }, []);



  // ログを追加する関数
  const addLog = () => {
    const t = text.trim();
    if (!t) return;

    const newLogs = [...logs, t];
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs)); 
  // ローカルストレージは文字列しか保存できないため、JSON.stringifyで文字列に変換
  
    setText(""); // 入力欄クリア
  };



  // 編集内容を保存する関数（Update：更新）
  const updateLog = () => {
    if (editIndex === null) return; // 編集対象がない（null）なら何もしない

    const t = editText.trim();
    if (!t) return; // 空文字なら何もしない

    const newLogs = logs.map((log, index) =>
      index === editIndex ? t : log
    );

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
    const newLogs = logs.filter((_, i) => i !== index);
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映
  };










  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>筋トレログ</h1>


      {/* 追加の入力欄 */}
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addLog(); //もし入力されたキーがエンターキーの場合に、addLog関数を実行する。
          }
        }}
        placeholder="ここに入力してください"
      />

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
          <span>{log}</span>

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
