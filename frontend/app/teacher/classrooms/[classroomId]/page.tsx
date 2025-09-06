import React from "react";

type Props = {
  params: { id: string };
};

const ClassroomPage = ({ params }: Props) => {
  return (
    <main>
      <h1>教室ID: {params.id}</h1>
      <p>ここに教室の情報や生徒一覧を表示します。</p>
    </main>
  );
};

export default ClassroomPage;
