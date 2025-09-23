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

// 配信1件分
type DeliveryRow = {
  id: number;
  recipient_id: number | null;
  recipient_name: string | null;
  recipient_email: string | null;
  confirmed_at: string | null;          // ← read_at ではなく confirmed_at
  status?: 'sent' | 'confirmed' | 'responded' | string;
};

// 先生用 詳細データ（サーバの serialize_message に合わせる）
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
  deliveries?: DeliveryRow[];      // ★追加：確認状況をここに載せる
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
            {/* ★追加: 確認済み / 未確認の一覧 */}
            {Array.isArray(data.deliveries) && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 1 }} />
                {(() => {
                  const read = data.deliveries.filter(d => !!d.confirmed_at);
                  const unread = data.deliveries.filter(d => !d.confirmed_at);
                  return (
                    <Box display="grid" gap={2}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2">確認済み</Typography>
                          <Chip size="small" label={`${read.length}人`} />
                        </Stack>
                        {read.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">まだ誰も確認していません</Typography>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            {read.map(d => (
                              <li key={d.id}>
                                <Typography variant="body2">
                                  {d.recipient_name ?? '(不明)'} <span style={{ color: '#888' }}>({d.recipient_email ?? '-'})</span>
                                  {d.confirmed_at && ` / 既読: ${new Date(d.confirmed_at).toLocaleString()}`}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Box>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2">未確認</Typography>
                          <Chip size="small" label={`${unread.length}人`} />
                        </Stack>
                        {unread.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">未確認者はいません</Typography>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            {unread.map(d => (
                              <li key={d.id}>
                                <Typography variant="body2">
                                  {d.recipient_name ?? '(不明)'} <span style={{ color: '#888' }}>({d.recipient_email ?? '-'})</span>
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Container>
  );
}
