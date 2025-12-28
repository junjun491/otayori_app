import React from "react";

type Props = {
  // ★ params は Promise でラップする
  params: Promise<{ classroomId: string }>;
};

const ClassroomPage = async ({ params }: Props) => {
  // ★ Promise なので await して中身を取り出す
  const { classroomId } = await params;

  return (
    <main>
      <h1>教室ID: {classroomId}</h1>
      <p>ここに教室の情報や生徒一覧を表示します。</p>
    </main>
  );
};

export default ClassroomPage;