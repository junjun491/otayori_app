'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { apiFetch } from '@/lib/api';
type CreateMessageResponse = { data: { id: number } };

export default function MessageNewPage() {
  const { id: classroomId } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // UIはローカル時刻で扱い、送信時にISOへ変換
  const [deadlineLocal, setDeadlineLocal] = useState(''); // 'YYYY-MM-DDTHH:mm'
  const [messageId, setMessageId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  function toISOFromLocal(datetimeLocal: string): string | undefined {
    if (!datetimeLocal) return undefined;
    // datetime-localはタイムゾーン情報を含まないので、ローカルとみなしてDate生成→ISO化
    const d = new Date(datetimeLocal);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString(); // 例: 2025-09-30T14:59:00.000Z
  }

  async function createMessage() {
    setErr(null); setFlash(null);
    if (!title.trim()) { setErr('タイトルは必須です'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, any> = { title: title.trim(), content };
      const iso = toISOFromLocal(deadlineLocal);
      if (iso) body.deadline = iso;

      const res = await apiFetch(`/classrooms/${classroomId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: body }),
      });

      const payload = (await res.json()) as CreateMessageResponse;
      const id = payload.data.id;

      if (!id) throw new Error('作成レスポンスにIDが含まれていません');

      setMessageId(id);
      setFlash('下書きを作成しました。続けて公開できます。');
    } catch (e: any) {
      // api() 内で throw された場合の message or サーバのJSON errors/message
      setErr(e?.message ?? '下書き作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  async function publishMessage() {
    if (!messageId) return;
    setErr(null); setFlash(null);
    setPublishing(true);
    try {
      const res = await apiFetch(
        `/classrooms/${classroomId}/messages/${messageId}/publish`,
        {
          method: 'POST',
          body: JSON.stringify({ message: {} }),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson?.errors?.join?.('\n') ?? errJson?.message ?? `HTTP ${res.status}`
        );
      }

      setFlash('公開しました。');
      router.replace(`/classrooms/${classroomId}/messages/${messageId}`);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">お便り作成</Typography>
        <Typography color="text.secondary">クラスID：{classroomId}</Typography>
      </Box>

      {flash && <Alert severity="success" sx={{ mb:2, whiteSpace:'pre-line' }}>{flash}</Alert>}
      {err && <Alert severity="error" sx={{ mb:2, whiteSpace:'pre-line' }}>{err}</Alert>}

      <Stack spacing={2}>
        <TextField
          label="タイトル"
          fullWidth
          value={title}
          onChange={e=>setTitle(e.target.value)}
          inputProps={{ maxLength: 120 }}
          required
        />
        <TextField
          label="本文"
          fullWidth
          multiline
          minRows={6}
          value={content}
          onChange={e=>setContent(e.target.value)}
        />
        <TextField
          label="回答期限（任意）"
          type="datetime-local"
          fullWidth
          value={deadlineLocal}
          onChange={e=>setDeadlineLocal(e.target.value)}
          helperText="未指定可。指定した場合は公開後の締切判定に使用します。"
        />
        <Box>
          <Button
            variant="contained"
            onClick={createMessage}
            sx={{ mr:2 }}
            disabled={submitting}
          >
            {submitting ? '作成中…' : '下書きを作成'}
          </Button>
          <Button
            variant="outlined"
            onClick={publishMessage}
            disabled={!messageId || publishing}
          >
            {publishing ? '公開中…' : '公開'}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
