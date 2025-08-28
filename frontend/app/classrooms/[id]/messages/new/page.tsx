'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { api } from '@/lib/api';

export default function MessageNewPage() {
  const params = useParams<{ id: string }>();
  const classroomId = params.id;
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState(''); // ISO 8601 文字列
  const [messageId, setMessageId] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function createMessage() {
    setErr(null); setFlash(null);
    try {
      const body: any = { title, content };
      if (deadline) body.deadline = deadline;
      const { data } = await api(`/classrooms/${classroomId}/messages`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const id = data?.data?.id ?? data?.data?.message?.id ?? data?.data?.id;
      setMessageId(id);
      setFlash('下書きを作成しました。続けて公開できます。');
    } catch (e:any) {
      setErr(e.message);
    }
  }

  async function publishMessage() {
    if (!messageId) return;
    setErr(null); setFlash(null);
    try {
      await api(`/classrooms/${classroomId}/messages/${messageId}/publish`, { method: 'POST' });
      setFlash('公開しました。');
    } catch (e:any) {
      setErr(e.message);
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">お便り作成</Typography>
        <Typography color="text.secondary">クラスID：{classroomId}</Typography>
      </Box>

      {flash && <Alert severity="success" sx={{ mb:2 }}>{flash}</Alert>}
      {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

      <Stack spacing={2}>
        <TextField label="タイトル" fullWidth value={title} onChange={e=>setTitle(e.target.value)} />
        <TextField label="本文" fullWidth multiline minRows={6} value={content} onChange={e=>setContent(e.target.value)} />
        <TextField
          label="回答期限（例: 2025-09-30T23:59:00+09:00）"
          fullWidth value={deadline} onChange={e=>setDeadline(e.target.value)}
          placeholder="YYYY-MM-DDTHH:mm:ss+09:00"
        />
        <Box>
          <Button variant="contained" onClick={createMessage} sx={{ mr:2 }}>下書きを作成</Button>
          <Button variant="outlined" onClick={publishMessage} disabled={!messageId}>公開</Button>
        </Box>
      </Stack>
    </Container>
  );
}
