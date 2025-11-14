import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState(""); // 入力された文字列を保持する
  const [logs, setLogs] = useState<string[]>([]); // ログの配列を保持する

  
  //アプリ起動時にlocalStorageから保存したフォルダ(ログ)を読み込む 
  useEffect(() => { 
    const saved = localStorage.getItem("logs"); // getItem：保存された文字列を取り出す

    if (saved) { 
      setLogs(JSON.parse(saved)); // JSON.parse: (コンピュータが扱えるようなデータ構造に変換する)文字列を配列に変換する
    }
  }, []); // 空の配列を渡すことで、初回レンダリング時のみ実行される  useEffect(処理, [監視したい値の一覧]);


  const addLog = () => {
    const t =text.trim();
    if(!t) return;

    const newLogs = [...logs, t];
    setLogs(newLogs);

    localStorage.setItem("logs", JSON.stringify(newLogs)); // JSON.stringify: 配列を文字列に変換する setItem：文字列を保存する
    //ローカルストレージは文字列しか保存できないため
    setText("");
  };

  

  return (
  <div style ={{ padding: "20px" , color: "white"}}>
    <h1>筋トレログ</h1>
    <input 
      value={text}
      onChange={(e) => setText(e.target.value)} //入力が変わる度に状態を更新する
      onKeyDown={(e) => {
        if(e.key === "Enter") addLog();
      }}
      placeholder="ここに入力してください"
      />
    <button onClick={addLog}>追加</button>

    <ul>
      {logs.map((log, index) => (
        <li key={index}>{log}</li>
      ))}
    </ul>


  </div>
  );
}