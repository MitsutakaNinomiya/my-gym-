import { useEffect, useState } from "react";

// ------------ 型定義（TypeScriptの型） ------------

// 画面モード
type View = "calendar" | "day" | "selectExercise" | "editSets";

// 部位
type BodyPart = {
  id: string;
  name: string;
};

// 種目
type Exercise = {
  id: string;
  bodyPartId: string;
  name: string;
};

// 1セットの記録
type SetRecord = {
  setNumber: number;
  weight: number;
  reps: number;
  memo: string;
};

// 1つの「種目の記録」
type WorkoutEntry = {
  id: string;
  date: string; // "2025-11-17"
  bodyPartId: string;
  exerciseId: string;
  sets: SetRecord[];
  createdAt: string;
};

// 編集中フォーム用の1セット入力
type SetInput = {
  weight: string;
  reps: string;
  memo: string;
};

// ------------ 定数データ（部位・種目） ------------

const BODY_PARTS: BodyPart[] = [
  { id: "chest", name: "胸" },
  { id: "back", name: "背中" },
  { id: "shoulder", name: "肩" },
  { id: "leg", name: "脚" },
  { id: "arm", name: "腕" },
];

const EXERCISES: Exercise[] = [
  { id: "bench_press", bodyPartId: "chest", name: "ベンチプレス" },
  { id: "dumbbell_fly", bodyPartId: "chest", name: "ダンベルフライ" },
  { id: "incline_press", bodyPartId: "chest", name: "インクラインプレス" },

  { id: "lat_pull_down", bodyPartId: "back", name: "ラットプルダウン" },
  { id: "deadlift", bodyPartId: "back", name: "デッドリフト" },
  { id: "seated_row", bodyPartId: "back", name: "シーテッドロー" },

  { id: "shoulder_press", bodyPartId: "shoulder", name: "ショルダープレス" },
  { id: "side_raise", bodyPartId: "shoulder", name: "サイドレイズ" },
  { id: "rear_raise", bodyPartId: "shoulder", name: "リアレイズ" },

  { id: "squat", bodyPartId: "leg", name: "スクワット" },
  { id: "leg_press", bodyPartId: "leg", name: "レッグプレス" },
  { id: "leg_curl", bodyPartId: "leg", name: "レッグカール" },

  { id: "barbell_curl", bodyPartId: "arm", name: "バーベルカール" },
  { id: "dumbbell_curl", bodyPartId: "arm", name: "ダンベルカール" },
  { id: "pushdown", bodyPartId: "arm", name: "トライセプスプッシュダウン" },
];

const STORAGE_KEY = "workout_app_v3";

// ------------ 日付・カレンダー系ユーティリティ ------------

// 今日 "YYYY-MM-DD"
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// 年・月・日 から "YYYY-MM-DD"
function formatDate(year: number, month0: number, day: number): string {
  const m = String(month0 + 1).padStart(2, "0"); // month0: 0-11
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// カレンダー用マトリクス（6週×7日）
function createCalendarMatrix(
  year: number,
  month0: number
): (number | null)[][] {
  const first = new Date(year, month0, 1);
  const firstDayOfWeek = first.getDay(); // 0:日〜6:土
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let day = 1;

  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < firstDayOfWeek) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
  }

  return weeks;
}

// ある種目の「前回の記録」（指定日までで最新）
function getLastRecordBeforeDate(
  workouts: WorkoutEntry[],
  exerciseId: string,
  date: string,
  excludeId?: string | null
): WorkoutEntry | null {
  const filtered = workouts.filter(
    (w) =>
      w.exerciseId === exerciseId &&
      w.date <= date &&
      (!excludeId || w.id !== excludeId)
  );
  if (filtered.length === 0) return null;
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0];
}

// 表示用：ID → 名前
function getBodyPartName(id: string): string {
  return BODY_PARTS.find((b) => b.id === id)?.name ?? id;
}

function getExerciseName(id: string): string {
  return EXERCISES.find((e) => e.id === id)?.name ?? id;
}

// ------------ 初期セット入力（5セットぶん） ------------

const EMPTY_SET_INPUTS: SetInput[] = [
  { weight: "", reps: "", memo: "" },
  { weight: "", reps: "", memo: "" },
  { weight: "", reps: "", memo: "" },
  { weight: "", reps: "", memo: "" },
  { weight: "", reps: "", memo: "" },
];

// ------------ メインコンポーネント ------------

export default function App() {
  // 画面モード
  const [view, setView] = useState<View>("calendar");

  // カレンダーで表示中の年月
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month0, setMonth0] = useState<number>(today.getMonth()); // 0-11

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 全トレ記録
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // 編集中の部位・種目
  const [currentBodyPartId, setCurrentBodyPartId] = useState<string | null>(
    null
  );
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null
  );

  // 編集中の記録ID（null → 新規）
  const [editingEntryId, setEditingEntryId] = useState<string | null>(
    null
  );

  // 編集中の5セット分の入力
  const [setInputs, setSetInputs] =
    useState<SetInput[]>(EMPTY_SET_INPUTS);

  // 起動時：localStorage 読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WorkoutEntry[];
        setWorkouts(parsed);
      } catch (e) {
        console.error("Failed to parse workouts", e);
      }
    }
  }, []);

  // workouts 変更時：保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  // カレンダーの配列
  const calendarMatrix = createCalendarMatrix(year, month0);

  // 選択中の日付の記録
  const workoutsForSelectedDate: WorkoutEntry[] =
    selectedDate === null
      ? []
      : workouts.filter((w) => w.date === selectedDate);

  // 編集中種目の「前回の記録」
  const lastRecordForCurrent =
    currentExerciseId && selectedDate
      ? getLastRecordBeforeDate(
          workouts,
          currentExerciseId,
          selectedDate,
          editingEntryId
        )
      : null;

  // セット入力変更
  const updateSetInput = (
    index: number,
    field: "weight" | "reps" | "memo",
    value: string
  ) => {
    setSetInputs((prev) =>
      prev.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      )
    );
  };

  // カレンダーの日にちをクリック
  const handleClickDay = (day: number | null) => {
    if (!day) return;
    const dateStr = formatDate(year, month0, day);
    setSelectedDate(dateStr);
    setView("day");
  };

  // 月移動
  const goPrevMonth = () => {
    const newMonth = month0 - 1;
    if (newMonth < 0) {
      setMonth0(11);
      setYear((y) => y - 1);
    } else {
      setMonth0(newMonth);
    }
  };
  const goNextMonth = () => {
    const newMonth = month0 + 1;
    if (newMonth > 11) {
      setMonth0(0);
      setYear((y) => y + 1);
    } else {
      setMonth0(newMonth);
    }
  };

  // ＋ボタン → 新規の種目選択画面へ
  const goToSelectExercise = () => {
    setEditingEntryId(null); // 新規モード
    setView("selectExercise");
  };

  // 種目選択 → 新規セット入力画面へ
  const handleSelectExercise = (bodyPartId: string, exerciseId: string) => {
    setCurrentBodyPartId(bodyPartId);
    setCurrentExerciseId(exerciseId);
    setEditingEntryId(null); // 新規
    setSetInputs(EMPTY_SET_INPUTS);
    setView("editSets");
  };

  // 既存カードをタップ → 編集モードで開く
  const handleEditExisting = (entry: WorkoutEntry) => {
    setSelectedDate(entry.date);
    setCurrentBodyPartId(entry.bodyPartId);
    setCurrentExerciseId(entry.exerciseId);
    setEditingEntryId(entry.id);

    // 既存のセットをフォーム用に変換（足りない分は空欄で5セットにする）
    const inputs: SetInput[] = [];
    for (let i = 1; i <= 5; i++) {
      const existingSet = entry.sets.find((s) => s.setNumber === i);
      if (existingSet) {
        inputs.push({
          weight: String(existingSet.weight),
          reps: String(existingSet.reps),
          memo: existingSet.memo,
        });
      } else {
        inputs.push({ weight: "", reps: "", memo: "" });
      }
    }
    setSetInputs(inputs);
    setView("editSets");
  };

  // 「戻る」で自動保存 → 日付画面へ
  const saveCurrentAndBackToDay = () => {
    if (!selectedDate || !currentBodyPartId || !currentExerciseId) {
      setView("day");
      return;
    }

    // 1セット以上、有効な入力があるかどうか
    const hasAny = setInputs.some(
      (s) => s.weight.trim() !== "" && s.reps.trim() !== ""
    );
    if (!hasAny) {
      // 何も入ってなければ保存せず戻る
      setView("day");
      return;
    }

    const sets: SetRecord[] = setInputs
      .map((s, index) => ({
        setNumber: index + 1,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        memo: s.memo.trim(),
      }))
      .filter((s) => s.weight > 0 && s.reps > 0);

    if (sets.length === 0) {
      setView("day");
      return;
    }

    setWorkouts((prev) => {
      // 編集モードなら既存を探す
      const existing =
        editingEntryId != null
          ? prev.find((w) => w.id === editingEntryId)
          : undefined;

      const newEntry: WorkoutEntry = {
        id:
          editingEntryId ??
          `${selectedDate}_${currentExerciseId}_${Date.now()}`, // 新規なら新ID
        date: selectedDate,
        bodyPartId: currentBodyPartId,
        exerciseId: currentExerciseId,
        sets,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };

      if (editingEntryId != null) {
        // 既存更新（上書き）
        return prev.map((w) => (w.id === editingEntryId ? newEntry : w));
      } else {
        // 新規追加
        return [...prev, newEntry];
      }
    });

    setSetInputs(EMPTY_SET_INPUTS);
    setEditingEntryId(null);
    setView("day");
  };

  // ------------ 各画面のUI ------------

  // カレンダー画面
  const renderCalendarView = () => {
    return (
      <div>
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          筋トレカレンダー
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <button
            onClick={goPrevMonth}
            style={{
              fontSize: "18px",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            ＜
          </button>
          <div style={{ fontWeight: "bold", fontSize: "20px" }}>
            {year}年 {month0 + 1}月
          </div>
          <button
            onClick={goNextMonth}
            style={{
              fontSize: "18px",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            ＞
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "6px",
                    borderBottom: "1px solid #ddd",
                    fontSize: "14px",
                    color: d === "日" ? "#e11d48" : undefined,
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarMatrix.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  const isToday =
                    day != null &&
                    formatDate(year, month0, day) === getToday();
                  const dateStr =
                    day != null ? formatDate(year, month0, day) : null;
                  const hasWorkout =
                    dateStr &&
                    workouts.some((w) => w.date === dateStr);

                  return (
                    <td
                      key={di}
                      onClick={() => handleClickDay(day)}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #f3f3f3",
                        cursor: day ? "pointer" : "default",
                        backgroundColor: isToday ? "#dbeafe" : undefined,
                        position: "relative",
                        fontSize: "16px",
                        color:
                          di === 0
                            ? "#e11d48"
                            : di === 6
                            ? "#2563eb"
                            : undefined,
                      }}
                    >
                      {day ?? ""}
                      {hasWorkout && (
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            position: "absolute",
                            bottom: "6px",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 日付画面
  const renderDayView = () => {
    if (!selectedDate) return null;

    return (
      <div>
        <button
          onClick={() => setView("calendar")}
          style={{
            marginBottom: "10px",
            fontSize: "16px",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ＜ カレンダーに戻る
        </button>

        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
          {selectedDate} のトレーニング
        </h2>

        {workoutsForSelectedDate.length === 0 ? (
          <p
            style={{
              fontSize: "16px",
              color: "#555",
              marginBottom: "20px",
            }}
          >
            まだ記録がありません。
          </p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {workoutsForSelectedDate.map((w) => (
              <li
                key={w.id}
                onClick={() => handleEditExisting(w)}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "10px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {getBodyPartName(w.bodyPartId)} /{" "}
                    {getExerciseName(w.exerciseId)}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#2563eb",
                    }}
                  >
                    タップで編集
                  </span>
                </div>
                <div>
                  {w.sets
                    .map(
                      (s) =>
                        `${s.setNumber}set: ${s.weight}kg × ${s.reps}回${
                          s.memo ? `（${s.memo}）` : ""
                        }`
                    )
                    .join(" / ")}
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={goToSelectExercise}
          style={{
            marginTop: "18px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          <span style={{ fontSize: "22px" }}>＋</span>
          <span>タップしてトレーニング記録を追加</span>
        </button>
      </div>
    );
  };

  // 部位 → 種目選択画面
  const renderSelectExerciseView = () => {
    if (!selectedDate) return null;

    return (
      <div>
        <button
          onClick={() => setView("day")}
          style={{
            marginBottom: "10px",
            fontSize: "16px",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ＜ {selectedDate} に戻る
        </button>

        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
          種目を選択
        </h2>
        <p style={{ fontSize: "16px", color: "#555", marginBottom: "14px" }}>
          部位 → 種目をタップして、セットを入力します。
        </p>

        {BODY_PARTS.map((part) => {
          const exercises = EXERCISES.filter(
            (ex) => ex.bodyPartId === part.id
          );
          return (
            <div
              key={part.id}
              style={{
                marginBottom: "14px",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "6px",
                  fontSize: "17px",
                }}
              >
                {part.name}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() =>
                      handleSelectExercise(part.id, ex.id)
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: "9999px",
                      border: "1px solid #2563eb",
                      background: "#eff6ff",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // セット入力画面（前回記録つき）
  const renderEditSetsView = () => {
    if (!selectedDate || !currentBodyPartId || !currentExerciseId) {
      return null;
    }

    return (
      <div>
        <button
          onClick={saveCurrentAndBackToDay}
          style={{
            marginBottom: "10px",
            fontSize: "16px",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          ＜ 戻る（自動保存）
        </button>

        <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>
          {selectedDate}
        </h2>
        <div
          style={{
            fontSize: "16px",
            color: "#333",
            marginBottom: "14px",
          }}
        >
          {getBodyPartName(currentBodyPartId)} /{" "}
          {getExerciseName(currentExerciseId)}
        </div>

        {/* 前回の記録 */}
        <div
          style={{
            borderRadius: "10px",
            background: "#f5f5f5",
            padding: "10px",
            marginBottom: "14px",
          }}
        >
          <strong style={{ fontSize: "16px" }}>前回の記録</strong>
          {lastRecordForCurrent ? (
            <ul
              style={{
                marginTop: "6px",
                paddingLeft: "20px",
                fontSize: "14px",
              }}
            >
              {lastRecordForCurrent.sets.map((s) => (
                <li key={s.setNumber}>
                  {s.setNumber}set: {s.weight}kg × {s.reps}回{" "}
                  {s.memo && <>（{s.memo}）</>}
                </li>
              ))}
            </ul>
          ) : (
            <p
              style={{
                marginTop: "6px",
                fontSize: "14px",
                color: "#777",
              }}
            >
              まだこの種目の記録はありません。
            </p>
          )}
        </div>

        {/* 今回の入力 ＋ 隣に前回 */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "6px",
                }}
              >
                セット
              </th>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "6px",
                }}
              >
                今回 重量(kg)
              </th>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "6px",
                }}
              >
                今回 回数
              </th>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "6px",
                }}
              >
                メモ
              </th>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "6px",
                }}
              >
                前回
              </th>
            </tr>
          </thead>
          <tbody>
            {setInputs.map((input, index) => {
              const setNumber = index + 1;
              const lastSet =
                lastRecordForCurrent?.sets.find(
                  (s) => s.setNumber === setNumber
                ) ?? null;

              return (
                <tr key={index}>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      textAlign: "center",
                      padding: "6px",
                    }}
                  >
                    {setNumber}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "6px",
                    }}
                  >
                    <input
                      type="number"
                      value={input.weight}
                      onChange={(e) =>
                        updateSetInput(
                          index,
                          "weight",
                          e.target.value
                        )
                      }
                      style={{ width: "80px", fontSize: "14px" }}
                    />
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "6px",
                    }}
                  >
                    <input
                      type="number"
                      value={input.reps}
                      onChange={(e) =>
                        updateSetInput(
                          index,
                          "reps",
                          e.target.value
                        )
                      }
                      style={{ width: "80px", fontSize: "14px" }}
                    />
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "6px",
                    }}
                  >
                    <input
                      type="text"
                      value={input.memo}
                      onChange={(e) =>
                        updateSetInput(
                          index,
                          "memo",
                          e.target.value
                        )
                      }
                      style={{ width: "100%", fontSize: "14px" }}
                      placeholder="メモ"
                    />
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lastSet
                      ? `${lastSet.weight}kg × ${lastSet.reps}回`
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          ※「戻る」を押すと、入力されているセットが自動的に保存されます。
          （新規追加 or 既存の上書き）
        </p>
      </div>
    );
  };

  // ------------ メインの描画 ------------

  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: "720px",
        margin: "0 auto",
        padding: "24px",
        fontSize: "18px", // ★ 全体のベースサイズを大きく
      }}
    >
      {view === "calendar" && renderCalendarView()}
      {view === "day" && renderDayView()}
      {view === "selectExercise" && renderSelectExerciseView()}
      {view === "editSets" && renderEditSetsView()}
    </div>
  );
}
