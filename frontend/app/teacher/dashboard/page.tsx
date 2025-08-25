'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Container, Box, Typography, List, ListItem, ListItemText, Divider, Button, Alert } from '@mui/material';

type Teacher = { id: number; name: string; email: string };
type Classroom = { id: number; name: string };
type Student = { id: number; name: string; email: string };

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // 教師プロフィール（APIは適宜合わせてください）
        const meRes = await apiFetch('/me'); // 例: { data: { teacher: {...} } }
        const meBody = await meRes.json().catch(() => ({}));
        setTeacher(meBody?.data?.teacher || meBody?.teacher || null);

        // 教室（担任1クラス想定：先頭ひとつを採用）
        const clsRes = await apiFetch('/classrooms');
        const clsBody = await clsRes.json().catch(() => ({}));
        const cls = (clsBody?.data && clsBody.data[0]) || clsBody?.[0] || null;
        setClassroom(cls);

        if (cls?.id) {
          let list: Student[] = [];
          const stRes = await apiFetch(`/classrooms/${cls.id}/students`);
          if (stRes.ok) {
            const stBody = await stRes.json().catch(() => ({}));
            list = stBody?.data || stBody || [];
          } else {
            list = [];
          }
          setStudents(list);
        }
      } catch {
        setError('ダッシュボード情報の取得に失敗しました');
      }
    })();
  }, []);

  return (
    <Container maxWidth="md">
      <Box mt={6}>
        <Typography variant="h4">教師ダッシュボード</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box mt={4}>
        <Typography variant="h6">アカウント情報</Typography>
        <Typography variant="body1">名前：{teacher?.name ?? '-'}</Typography>
        <Typography variant="body1">メール：{teacher?.email ?? '-'}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6">担任クラス</Typography>
        <Typography variant="body1">クラス名：{classroom?.name ?? '-'}</Typography>

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
          <Button component={Link} href="/teacher/invitations" variant="contained">
            生徒招待へ
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
