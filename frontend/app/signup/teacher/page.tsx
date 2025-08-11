'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert
} from '@mui/material'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('メールアドレスの形式で入力してください'),
  password: z.string().min(6, '6文字以上で入力してください'),
  passwordConfirmation: z.string().min(6, '6文字以上で入力してください')
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirmation']
})

type FormData = z.infer<typeof schema>

export default function TeacherSignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('http://localhost:3001/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacher: {
            name: data.name,
            email: data.email,
            password: data.password,
            password_confirmation: data.passwordConfirmation
          }
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || '登録に失敗しました')
      }

      router.push('/login')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          教師アカウント登録
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
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
  )
}
