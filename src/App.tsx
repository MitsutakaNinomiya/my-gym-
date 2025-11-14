import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState(""); // 入力された文字列を保持する（追加用）
  const [logs, setLogs] = useState<string[]>([]); // ログの配列を保持する

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
    localStorage.setItem("logs", JSON.stringify(newLogs)); // 配列を文字列に変換して保存

    setText(""); // 入力欄クリア
  };



  // 編集内容を保存する関数（Update：更新）
  const updateLog = () => {
    if (editIndex === null) return; // 編集対象がない（null）なら何もしない

    const t = editText.trim();
    if (!t) return; // 空文字なら何もしない



    // 編集した内容で logs 配列を更新（map：配列を1つずつ見て新しい配列を作る）
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
  const handleDelete = (index: number) => {
    // filter：条件に合うものだけ残して新しい配列を作る
    const newLogs = logs.filter((_, i) => i !== index);
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs)); // ローカルストレージにも反映
  };










  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>筋トレログ</h1>



      {/* 追加と編集で共通の入力欄 */}
      <input
        value={editIndex === null ? text : editText}
        onChange={(e) => {
          const v = e.target.value;
          if (editIndex === null) {
            setText(v);      // 追加モード
          } else {
            setEditText(v);  // 編集モード
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (editIndex === null) {
              addLog();     // 追加
            } else {
              updateLog();  // 保存（更新）
            }
          }
        }}
        placeholder="ここに入力してください"
      />



      {/* 追加 / 保存ボタン（モードで出し分け） */}
      <button onClick={editIndex === null ? addLog : updateLog}>
        {editIndex === null ? "追加" : "保存"}
      </button>

      <ul>
        {logs.map((log, index) => (
          <li
            key={index}
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <span>{log}</span>

            {/* 編集ボタン */}
            <button onClick={() => startEdit(index, log)}>編集</button>

            {/* 削除ボタン */}
            <button onClick={() => handleDelete(index)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
