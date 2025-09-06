'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { MessageShow } from '@/types/messages';
import { Container, Box, Typography, Alert, CircularProgress, TextField, Button, Paper } from '@mui/material';

type RouteParams = { classroomId: string; messageId: string };

export default function MessageDetailPage() {
  const params = useParams();
  const { classroomId, messageId } = params as unknown as RouteParams;
  const router = useRouter();

  const [data, setData] = useState<MessageShow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');

  const deadlinePassed = useMemo(() => {
    if (!data?.deadline) return false;
    return new Date(data.deadline) < new Date();
  }, [data?.deadline]);

  useEffect(() => {
    (async () => {
      try {
        // 詳細取得
        const res = await apiFetch(`/classrooms/${classroomId}/messages/${messageId}`);
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if ((j as any)?.error) msg = String((j as any).error);
          } catch {}
          throw new Error(msg);
        }
        const json = (await res.json()) as MessageShow;
        setData(json);

        // 既読反映（失敗は握りつぶし）
        try {
          await apiFetch(`/classrooms/${classroomId}/messages/${messageId}/read`, { method: 'POST' });
        } catch {}

        // 既存回答があれば初期値に反映
        if (json.delivery?.form_data?.text) setAnswer(json.delivery.form_data.text);
      } catch (e: any) {
        setErr(e?.message ?? 'failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId, messageId]);

  async function onSubmit() {
    if (!data) return;
    try {
      const res = await apiFetch(`/classrooms/${classroomId}/messages/${messageId}/response`, {
        method: 'POST',
        body: JSON.stringify({ response: { form_data: { text: answer } } }),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if ((j as any)?.error) msg = String((j as any).error);
        } catch {}
        throw new Error(msg);
      }
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e?.message ?? 'failed');
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">お便り</Typography>
        <Typography color="text.secondary">詳細と回答</Typography>
      </Box>

      {err && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{err}</Alert>}
      {loading && <CircularProgress />}

      {data && (
        <Box display="grid" gap={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>{data.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              公開: {new Date(data.published_at).toLocaleString()}　
              期限: {data.deadline ? new Date(data.deadline).toLocaleString() : '-'}
            </Typography>
            {data.content_html
              ? <Box sx={{ mt: 2 }} dangerouslySetInnerHTML={{ __html: data.content_html }} />
              : <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{data.content_text ?? ''}</Typography>}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{data.form?.label ?? '回答'}</Typography>
            <TextField
              label="回答内容"
              fullWidth multiline minRows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={deadlinePassed}
            />
            {deadlinePassed && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                期限を過ぎています。送信はできません（APIは 422 / {"{ error: \"deadline_passed\" }"} を返す想定）。
              </Alert>
            )}
            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => history.back()}>戻る</Button>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={deadlinePassed || (data.form?.required && !answer.trim())}
              >
                回答を送信
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
}
