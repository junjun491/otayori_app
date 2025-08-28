'use client';

import { useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button,
  ToggleButton, ToggleButtonGroup, Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  API_BASE, getToken, setToken, safeNextParam,
  getRoleFromToken, isTokenExpired
} from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  // ログイン対象ロール（UIの選択値）
  const [selectedRole, setSelectedRole] = useState<'teachers'|'students'>('teachers');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 既ログインなら /login をスキップ（トークン中のロールで遷移先分岐）
  useEffect(() => {
    const t = getToken();
    if (t && !isTokenExpired()) {
      const roleFromToken = getRoleFromToken();
      const fallback = '/dashboard';
      const defaultPath = roleFromToken === 'teacher' ? '/teacher/dashboard' : fallback;
      router.replace(safeNextParam(defaultPath));
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);
    setLoading(true);
    try {
      // サインインAPIは UI で選んだロールを使用（未ログインなのでトークン参照しない）
      const endpointRole = selectedRole;                 // 'teachers' | 'students'
      const payloadKey = endpointRole.slice(0, -1);      // 'teacher'  | 'student'

      const res = await fetch(`${API_BASE}/${endpointRole}/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [payloadKey]: { email, password } }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || 'sign_in_failed');
      }

      // レスポンスヘッダから Authorization を保存（CORS: expose ["Authorization"] 必須）
      const auth = res.headers.get('Authorization') || res.headers.get('authorization');
      if (auth) setToken(auth);

      setOk('ログインしました。');

      // 保存直後のトークンからロールを判定して遷移
      const roleFromToken = getRoleFromToken();
      const defaultPath = roleFromToken === 'teacher' ? '/teacher/dashboard' : '/dashboard';
      router.replace(safeNextParam(defaultPath));
    } catch (e: any) {
      setErr(e.message || 'login_error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>ログイン</Typography>

        <ToggleButtonGroup
          exclusive
          value={selectedRole}
          onChange={(_, v)=> v && setSelectedRole(v)}
          sx={{ mb:2 }}
        >
          <ToggleButton value="teachers">教師</ToggleButton>
          <ToggleButton value="students">生徒</ToggleButton>
        </ToggleButtonGroup>

        {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
        {ok && <Alert severity="success" sx={{ mb:2 }}>{ok}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            label="Email"
            fullWidth
            sx={{ mb:2 }}
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb:2 }}
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? '送信中...' : 'ログイン'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
