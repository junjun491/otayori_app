'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { setToken as saveJwt } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

const schema = z
  .object({
    name: z.string().min(1, '名前は必須です'),
    email: z.string().email('メールアドレスの形式で入力してください'),
    password: z.string().min(6, '6文字以上で入力してください'),
    passwordConfirmation: z.string().min(6, '6文字以上で入力してください'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'パスワードが一致しません',
    path: ['passwordConfirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function StudentSignupPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [error, setError] = useState('');
  const [invToken, setInvToken] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  const ran = useRef(false); // ★ StrictModeでも二重実行されないようにガード

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const t = sp.get('token') ?? '';
    const c = sp.get('classroom_id') ?? '';

    if (!t || !c) {
      router.replace('/signup/invalid?reason=missing');
      return;
    }

    setInvToken(t);
    setClassroomId(c);

    (async () => {
      try {
        const res = await apiFetch(
          `/classrooms/${encodeURIComponent(c)}/invitations/verify?token=${encodeURIComponent(t)}`
        );

        const body = await res.json().catch(() => ({} as any));

        if (!res.ok) {
          const reason = body?.error || 'invalid';
          router.replace(`/signup/invalid?reason=${encodeURIComponent(String(reason))}`);
          return;
        }

        if (body?.data?.email) setValue('email', body.data.email);
        setIsVerifying(false);
      } catch {
        router.replace('/signup/invalid?reason=network');
      }
    })();
  }, [sp, router, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify({
          student: {
            name: data.name,
            email: data.email,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
          },
          token: invToken,
          classroom_id: classroomId,
        }),
      });

      if (!res.ok) {
        let msg = '登録に失敗しました';
        try {
          const j = await res.json();
          if (j?.error === 'email_taken') msg = 'このメールアドレスは既に使用されています。';
          else if (j?.error === 'invalid_invitation') msg = '招待の検証に失敗しました。';
          else if (j?.errors) msg = Array.isArray(j.errors) ? j.errors.join('\n') : String(j.errors);
          else if (j?.message) msg = String(j.message);
        } catch {}
        throw new Error(msg);
      }

      const auth = res.headers.get('Authorization');
      if (auth) {
        saveJwt(auth);
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    } catch (err: any) {
      setError(err?.message ?? '登録に失敗しました');
    }
  };

  if (isVerifying) {
    return (
      <Container maxWidth="sm">
        <Box mt={10} display="flex" alignItems="center" flexDirection="column" gap={2}>
          <Typography>招待を確認しています…</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          生徒アカウント登録
        </Typography>

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="名前"
            fullWidth
            margin="normal"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="メールアドレス"
            fullWidth
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="パスワード"
            type="password"
            fullWidth
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            label="パスワード（確認）"
            type="password"
            fullWidth
            margin="normal"
            {...register('passwordConfirmation')}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" fullWidth>
              登録する
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}
