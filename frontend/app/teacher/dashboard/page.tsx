'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Container, Box, Typography, List, ListItem, ListItemText,
  Divider, Button, Alert, Stack, TextField
} from '@mui/material';

type Teacher = { id: number; name: string; email: string };
type Classroom = { id: number; name: string };
type Student = { id: number; name: string; email: string };

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // 教師プロフィール（実装に合わせて '/teachers/profile' 等でもOK）
        const meRes = await apiFetch('/teachers/profile');
        const meBody = await meRes.json().catch(() => ({}));
        setTeacher(meBody?.data ?? null);

        // クラス（1クラス想定：先頭ひとつ）
        const clsRes = await apiFetch('/classrooms');
        const clsBody = await clsRes.json().catch(() => ({}));
        const cls = (clsBody?.data ?? null);
        setClassroom(cls);

        if (cls?.id) {
          await fetchStudents(cls.id);
        }
      } catch {
        setError('ダッシュボード情報の取得に失敗しました');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStudents(classroomId: number) {
    try {
      const stRes = await apiFetch(`/classrooms/${classroomId}/students`);
      if (!stRes.ok) { setStudents([]); return; }
      const stBody = await stRes.json().catch(() => ({}));
      setStudents(stBody?.data || stBody || []);
    } catch {
      setStudents([]);
    }
  }

  async function onCreateClassroom() {
    setError(''); setFlash('');
    const name = newClassroomName.trim();
    if (!name) { setError('クラス名を入力してください'); return; }

    try {
      const res = await apiFetch('/classrooms', {
        method: 'POST',
        body: JSON.stringify({ classroom: { name } })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.errors ? (Array.isArray(body.errors) ? body.errors.join('\n') : String(body.errors))
                 : body?.message || 'クラス作成に失敗しました';
        setError(msg);
        return;
      }
      const created: Classroom = body?.data || body; // { id, name } を想定
      setClassroom(created);
      setNewClassroomName('');
      setFlash('クラスを作成しました');
      if (created?.id) await fetchStudents(created.id);
    } catch {
      setError('クラス作成に失敗しました');
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6}>
        <Typography variant="h4">教師ダッシュボード</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
      {flash && <Alert severity="success" sx={{ mt: 2, whiteSpace: 'pre-line' }}>{flash}</Alert>}

      <Box mt={4}>
        <Typography variant="h6">アカウント情報</Typography>
        <Typography variant="body1">名前：{teacher?.name ?? '-'}</Typography>
        <Typography variant="body1">メール：{teacher?.email ?? '-'}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6">担任クラス</Typography>
        <Typography variant="body1">クラス名：{classroom?.name ?? '-'}</Typography>

        {/* クラス未作成時のみ：作成フォーム */}
        {!classroom && (
          <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>クラス作成</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="クラス名"
                fullWidth
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="例：1年A組"
              />
              <Button variant="contained" onClick={onCreateClassroom}>
                作成
              </Button>
            </Stack>
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="subtitle1">生徒一覧</Typography>
          <List dense>
            {students.length ? students.map(s => (
              <ListItem key={s.id}>
                <ListItemText primary={s.name} secondary={s.email} />
              </ListItem>
            )) : <Typography color="text.secondary">生徒はまだいません</Typography>}
          </List>
        </Box>

        <Box mt={2}>
          <Button
            component={Link}
            href="/teacher/invitations"
            variant="contained"
            disabled={!classroom} // クラス未作成なら招待は無効
          >
            生徒招待へ
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
