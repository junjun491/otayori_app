'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Box, Typography, Button, Card, CardActionArea, CardContent, Stack, Chip
} from '@mui/material';
import dayjs from 'dayjs';
import { apiFetch } from '@/lib/api';

type MessageListItem = {
  id: number;
  title: string;
  published_at: string | null;
  deadline: string | null;
  status: 'draft' | 'published' | 'disabled';
  // 先生側で把握したい集計（任意）：API で返しているなら表示
  receipts?: {
    total?: number;
    read?: number;
    responded?: number;
  };
};

type IndexResponse = {
  items: MessageListItem[];
};

export default function MessagesIndexPage() {
  const router = useRouter();
  const params = useParams<{ classroomId: string }>();
  const classroomId = params.classroomId;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MessageListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await apiFetch(`/classrooms/${classroomId}/messages`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json: IndexResponse = await res.json();
        if (!abort) setItems(json.items || []);
      } catch (e: any) {
        if (!abort) setErr(e.message || 'failed to fetch');
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [classroomId]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">お便り一覧</Typography>
        <Button
          variant="contained"
          onClick={() => router.push(`/teacher/classrooms/${classroomId}/messages/new`)}
        >
          新規作成
        </Button>
      </Box>

      {loading && <Typography>読み込み中...</Typography>}
      {err && <Typography color="error">取得に失敗しました：{err}</Typography>}
      {!loading && !err && items.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography>お便りはまだありません。</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => router.push(`/teacher/classrooms/${classroomId}/messages/new`)}
          >
            最初のお便りを作成
          </Button>
        </Box>
      )}

      <Stack spacing={2}>
        {items.map((m) => {
          const pub = m.published_at ? dayjs(m.published_at).format('YYYY/MM/DD HH:mm') : '—';
          const ddl = m.deadline ? dayjs(m.deadline).format('YYYY/MM/DD') : '—';
          const r = m.receipts || {};
          return (
            <Card key={m.id}>
              <CardActionArea
                onClick={() =>
                  router.push(`/teacher/classrooms/${classroomId}/messages/${m.id}`)
                }
              >
                <CardContent>
                  <Box display="flex" gap={1} alignItems="center" mb={0.5}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {m.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        m.status === 'draft'
                          ? '下書き'
                          : m.status === 'published'
                          ? '公開中'
                          : '無効'
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    公開: {pub}／期限: {ddl}
                  </Typography>
                  {(r.total || r.read || r.responded) && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      既読 {r.read ?? 0} / {r.total ?? 0}・回答 {r.responded ?? 0}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}
