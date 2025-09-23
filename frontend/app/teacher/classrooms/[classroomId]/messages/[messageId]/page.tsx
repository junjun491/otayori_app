'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Container, Box, Typography, Alert, CircularProgress,
  Button, Paper, Chip, Stack, Divider
} from '@mui/material';
import dayjs from 'dayjs';

type RouteParams = { classroomId: string; messageId: string };

// 先生用 詳細データの想定型（サーバの serialize_message に合わせる）
type TeacherMessageShow = {
  id: number;
  classroom_id: number;
  title: string;
  content?: string | null;        // プレーン
  content_html?: string | null;   // HTML（あれば優先表示）
  status: 'draft' | 'published' | 'disabled';
  published_at: string | null;
  deadline: string | null;
  target_all: boolean;
  recipient_count?: number;
  recipients?: { id: number; name: string; email: string }[]; // include時のみ
};

export default function TeacherMessageDetailPage() {
  const { classroomId, messageId } = useParams() as unknown as RouteParams;
  const router = useRouter();

  const [data, setData] = useState<TeacherMessageShow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [doing, setDoing] = useState<'publish' | 'disable' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 先生用 詳細取得（サーバは { data: {...} } を返す）
        const res = await apiFetch(`/classrooms/${classroomId}/messages/${messageId}`);
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if ((j as any)?.error) msg = String((j as any).error);
          } catch {}
          throw new Error(msg);
        }
        const json = await res.json();
        setData(json?.data ?? json); // {data:{...}} or {...}
      } catch (e: any) {
        setErr(e?.message ?? 'failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId, messageId]);

  const pubLabel =
    data?.status === 'draft' ? '下書き' :
    data?.status === 'published' ? '公開中' :
    '無効';

  async function onPublish() {
    if (!data) return;
    setDoing('publish');
    setErr(null);
    try {
      // 全員宛てを想定（個別宛先は UI 実装次第）
      const res = await apiFetch(`/classrooms/${classroomId}/messages/${messageId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ message: { target_all: true } })
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if ((j as any)?.error) msg = String((j as any).error);
        } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      setData(json?.data ?? json);
    } catch (e: any) {
      setErr(e?.message ?? 'failed');
    } finally {
      setDoing(null);
    }
  }

  async function onDisable() {
    if (!data) return;
    setDoing('disable');
    setErr(null);
    try {
      const res = await apiFetch(`/classrooms/${classroomId}/messages/${messageId}/disable`, {
        method: 'POST'
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if ((j as any)?.error) msg = String((j as any).error);
        } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      setData(json?.data ?? json);
    } catch (e: any) {
      setErr(e?.message ?? 'failed');
    } finally {
      setDoing(null);
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4">お便り（教師用）</Typography>
          <Typography color="text.secondary">詳細・公開/無効化・宛先状況</Typography>
        </Box>

        {/* 一覧へ戻る */}
        <Button
          variant="outlined"
          onClick={() => router.push(`/teacher/classrooms/${classroomId}/messages`)}
        >
          一覧へ戻る
        </Button>
      </Box>

      {err && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{err}</Alert>}
      {loading && <CircularProgress />}

      {data && (
        <Box display="grid" gap={3}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h5">{data.title}</Typography>
              <Chip size="small" label={pubLabel} />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              公開: {data.published_at ? dayjs(data.published_at).format('YYYY/MM/DD HH:mm') : '—'}　
              期限: {data.deadline ? dayjs(data.deadline).format('YYYY/MM/DD') : '—'}
            </Typography>

            <Divider sx={{ my: 2 }} />
            {data.content_html
              ? <Box sx={{ mt: 1 }} dangerouslySetInnerHTML={{ __html: data.content_html }} />
              : <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{data.content ?? ''}</Typography>}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">配信状況</Typography>
              <Stack direction="row" spacing={1}>
                {/* 下書き → 公開 */}
                {data.status === 'draft' && (
                  <Button
                    variant="contained"
                    onClick={onPublish}
                    disabled={doing === 'publish'}
                  >
                    公開する
                  </Button>
                )}
                {/* 公開中 → 無効化 */}
                {data.status === 'published' && (
                  <Button
                    color="warning"
                    variant="outlined"
                    onClick={onDisable}
                    disabled={doing === 'disable'}
                  >
                    無効化
                  </Button>
                )}
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              宛先: {data.target_all ? '教室全員' : '一部の生徒'}
              {typeof data.recipient_count === 'number' && `（${data.recipient_count}名）`}
            </Typography>

            {/* recipients が返ってきていれば簡易表示（必要ならテーブル化して拡張） */}
            {Array.isArray(data.recipients) && data.recipients.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>宛先一覧</Typography>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {data.recipients.map(r => (
                    <li key={r.id}>
                      <Typography variant="body2">{r.name} <span style={{ color: '#888' }}>({r.email})</span></Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Container>
  );
}
