'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { InboxResponse, InboxItem } from '@/types/messages';
import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Card, CardActionArea, CardContent, Chip, Alert, CircularProgress } from '@mui/material';

function fmt(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/my/inbox');
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if ((j as any)?.error) msg = String((j as any).error);
          } catch {}
          throw new Error(msg);
        }
        const data = (await res.json()) as InboxResponse;
        setItems(data.items ?? []);
      } catch (e: any) {
        setErr(e?.message ?? 'failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">受信箱</Typography>
        <Typography color="text.secondary">届いたお便り一覧</Typography>
      </Box>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {loading && <CircularProgress />}

      <Box display="grid" gap={2}>
        {items.map((it) => {
          const isRead = !!it.read_at;
          const expired = it.deadline ? new Date(it.deadline) < new Date() : false;
          return (
            <Card key={String(it.message_id)} sx={{ border: isRead ? '1px solid #eee' : '2px solid #1976d2' }}>
              <CardActionArea onClick={() => router.push(`/messages/${it.message_id}`)}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {!isRead && <Chip label="未読" size="small" />}
                    {expired && <Chip label="期限切れ" size="small" color="warning" />}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>{it.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    公開: {fmt(it.published_at)}　期限: {fmt(it.deadline)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
        {!loading && items.length === 0 && (
          <Typography color="text.secondary">受信中のお便りはありません。</Typography>
        )}
      </Box>
    </Container>
  );
}
