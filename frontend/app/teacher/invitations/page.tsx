'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container, Box, Typography, TextField, Button, Alert, Table, TableHead, TableRow, TableCell, TableBody, Stack, IconButton, Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { apiFetch } from '@/lib/api';

type Classroom = { id: number; name: string };
type Invitation = { id: number; email: string; token: string; status: string; expires_at?: string | null; created_at?: string };

const schema = z.object({
  emails: z.string().min(1, 'メールアドレスを入力してください'),
  expiresInDays: z.string().optional(), // '' or number string
});

type FormData = z.infer<typeof schema>;

function signupUrl(origin: string, token: string, classroomId: number | string) {
  const base = origin.replace(/\/$/, '');
  return `${base}/signup/student?token=${encodeURIComponent(token)}&classroom_id=${encodeURIComponent(String(classroomId))}`;
}

export default function InvitationsPage() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [flash, setFlash] = useState('');
  const [error, setError] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  // クラス自動取得（担任1クラス想定）
  useEffect(() => {
    (async () => {
      try {
        const clsRes = await apiFetch('/classrooms');
        const clsBody = await clsRes.json().catch(() => ({}));
        const cls = (clsBody?.data && clsBody.data) || null;
        setClassroom(cls);
        if (cls?.id) await fetchInvitations(cls.id);
      } catch {
        setError('クラス情報の取得に失敗しました');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchInvitations(cid: number) {
    try {
      const res = await apiFetch(`/classrooms/${cid}/invitations`);
      const body = await res.json().catch(() => ({}));
      setInvitations(body?.data || body || []);
    } catch {
      setError('招待一覧の取得に失敗しました');
    }
  }

async function onCreate(data: FormData) {
  setError(''); setFlash('');
  if (!classroom?.id) { setError('クラス情報の取得前です。'); return; }

  // 有効期限（日）→ ISO
  let expires_at: string | undefined;
  if (data.expiresInDays && /^\d+$/.test(data.expiresInDays)) {
    const d = new Date();
    d.setDate(d.getDate() + Number(data.expiresInDays));
    expires_at = d.toISOString();
  }

  const emails = data.emails.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
  let okCount = 0;
  const errs: string[] = [];

  for (const email of emails) {
    try {
      const res = await apiFetch(`/classrooms/${classroom.id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          invitation: { email, ...(expires_at ? { expires_at } : {}) }
        }),
      });

      if (res.ok) {
        okCount += 1;
      } else {
        let msg = '';
        try {
          const j = await res.json();
          msg = j?.errors ? (Array.isArray(j.errors) ? j.errors.join(' / ') : String(j.errors))
               : j?.message || '';
        } catch {}
        if (!msg) msg = res.status === 404 ? 'APIが見つかりません (404)' : `HTTP ${res.status}`;
        errs.push(`${email}: ${msg}`);
      }
    } catch {
      errs.push(`${email}: ネットワークエラー`);
    }
  }

  if (errs.length) setError(errs.join('\n'));

  if (okCount > 0) {
    setFlash(`${okCount}件の招待を作成しました`);
    reset({ emails: '', expiresInDays: data.expiresInDays });
    // 一覧取得。404なら黙ってスキップ（未実装の間はノイズを出さない）
    try { await fetchInvitations(classroom.id); } catch {}
  } else {
    setFlash(''); // 成功0件ならフラッシュなし
  }
}


  async function copyUrl(inv: Invitation) {
    if (!classroom) return;
    await navigator.clipboard.writeText(signupUrl(origin, inv.token, classroom.id));
    setFlash('招待URLをコピーしました');
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">生徒招待</Typography>
        <Typography color="text.secondary">
          クラス：{classroom?.name ?? '-'}
        </Typography>
      </Box>

      {flash && <Alert severity="success" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{flash}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}

      <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, mb: 3 }}>
        <form onSubmit={handleSubmit(onCreate)} noValidate>
          <TextField
            label="メールアドレス（複数は改行/カンマ/空白区切り）"
            fullWidth multiline minRows={3}
            placeholder={`student1@example.com\nstudent2@example.com`}
            {...register('emails')}
            error={!!errors.emails} helperText={errors.emails?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            label="有効期限（日）(任意)"
            fullWidth placeholder="例: 7"
            {...register('expiresInDays')}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" disabled={isSubmitting || !classroom}>
            招待を作成
          </Button>
        </form>
      </Box>

      <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>招待一覧</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>期限</TableCell>
              <TableCell>作成</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.length ? invitations.map(inv => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email}</TableCell>
                <TableCell>{inv.status}</TableCell>
                <TableCell>{inv.expires_at ? new Date(inv.expires_at).toLocaleString() : '-'}</TableCell>
                <TableCell>{inv.created_at ? new Date(inv.created_at).toLocaleString() : '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="招待URLをコピー">
                    <IconButton onClick={() => copyUrl(inv)}><ContentCopyIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5}><Typography color="text.secondary">招待はまだありません</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
