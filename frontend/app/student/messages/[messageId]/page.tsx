'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Box, Typography, Alert, Chip, Button, Stack, Divider
} from '@mui/material';
import { apiFetch } from '@/lib/api';
import type { MessageShow } from '@/types/messages';

export default function StudentMessageDetailPage() {
  const { messageId } = useParams<{ messageId: string }>();
  const router = useRouter();

  const [data, setData] = useState<MessageShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const isRead = useMemo(() => !!data?.delivery?.read_at, [data?.delivery?.read_at]);
  const contentHtml = data?.content_html;
  const contentText = data?.content_text ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch(`/my/messages/${messageId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as MessageShow;
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => { load(); }, [load]);

  const markRead = async () => {
    if (isRead || posting) return;
    setPosting(true);
    setErr(null);

    // 楽観的更新
    const prev = data;
    if (prev) setData({ ...prev, delivery: { ...prev.delivery, read_at: new Date().toISOString() } });

    try {
      const res = await apiFetch(`/my/messages/${messageId}/read`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json(); // 期待: { ok: true, read_at: string }
      setData(d => d ? { ...d, delivery: { ...d.delivery, read_at: j.read_at ?? d.delivery.read_at } } : d);
    } catch (e: any) {
      // ロールバック
      setData(prev ?? null);
      setErr(e?.message ?? '既読操作に失敗しました');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">お便り</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={isRead ? '確認済み' : '未確認'} />
          <Button size="small" variant="outlined" onClick={() => router.push('/student/dashboard')}>
            受信箱へ戻る
          </Button>
        </Stack>
      </Box>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {loading && <Alert severity="info">読み込み中…</Alert>}

      {!loading && data && (
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>{data.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            クラスID: {data.classroom_id} / 公開: {data.published_at ?? '-'} / 期限: {data.deadline ?? '-'}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {contentHtml ? (
            // content_html はサーバ側でサニタイズ済みの前提
            <Box sx={{ mb: 3 }} dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <Box sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{contentText}</Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={markRead} disabled={posting || isRead}>
              {isRead ? '確認済みです' : '確認済みにする'}
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}
