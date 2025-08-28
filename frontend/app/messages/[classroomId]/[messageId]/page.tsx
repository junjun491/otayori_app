'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { api } from '@/lib/api';

export default function MessageDetailPage() {
  const params = useParams<{ classroomId: string; messageId: string }>();
  const classroomId = params.classroomId;
  const messageId = params.messageId;

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // メッセージ詳細
        const { data: msg } = await api(`/classrooms/${classroomId}/messages/${messageId}`);
        const info = msg?.data ?? msg;
        setTitle(info.title);
        setContent(info.content);

        // 自分の回答
        const { data: resp } = await api(`/classrooms/${classroomId}/messages/${messageId}/response`);
        if (resp?.data?.form_data) {
          setAnswer(resp.data.form_data.回答 ?? resp.data.form_data.comment ?? '');
        }
      } catch (e:any) {
        setErr(e.message);
      }
    })();
  }, [classroomId, messageId]);

  async function submit() {
    setErr(null); setFlash(null);
    try {
      await api(`/classrooms/${classroomId}/messages/${messageId}/response`, {
        method: 'POST',
        body: JSON.stringify({ form_data: { 回答: answer } }),
      });
      setFlash('回答を送信しました。');
    } catch (e:any) {
      setErr(e.message);
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h5" gutterBottom>{title || '（タイトル取得中）'}</Typography>
        <Typography color="text.secondary" sx={{ whiteSpace:'pre-wrap' }}>{content || ''}</Typography>
      </Box>

      {flash && <Alert severity="success" sx={{ mb:2 }}>{flash}</Alert>}
      {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

      <Stack spacing={2}>
        <TextField
          label="回答"
          fullWidth multiline minRows={3}
          value={answer} onChange={e=>setAnswer(e.target.value)}
        />
        <Button variant="contained" onClick={submit}>回答を送信</Button>
      </Stack>
    </Container>
  );
}
