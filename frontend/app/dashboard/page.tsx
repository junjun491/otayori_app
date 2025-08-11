'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export default function DashboardPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiClient('/messages');
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        // 未認証であればログインへ
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p className="text-center mt-10">読み込み中...</p>;

  return (
    <main className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">お知らせ一覧</h1>
      <ul className="space-y-4">
        {messages.map((msg: any) => (
          <li key={msg.id} className="p-4 border rounded shadow">
            <h2 className="font-semibold">{msg.title}</h2>
            <p className="text-sm text-gray-600">{msg.content}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
