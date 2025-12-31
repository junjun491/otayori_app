// app/signup/invalid/InvalidInvitationPage.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, Alert, Button } from '@mui/material';

function messageFor(reason: string | null) {
  switch (reason) {
    case 'missing':
      return '招待情報（token / classroom_id）が見つかりません。リンクをご確認ください。';
    case 'expired':
      return '招待の有効期限が切れています。教師に再発行を依頼してください。';
    case 'used':
      return 'この招待はすでに使用されています。心当たりが無い場合は教師に確認してください。';
    case 'invalid':
      return '招待が不正です。リンクの誤りや改ざんの可能性があります。';
    case 'network':
      return 'ネットワークエラーが発生しました。時間をおいて再度お試しください。';
    default:
      return '招待の確認に失敗しました。教師にご確認ください。';
  }
}

export default function InvalidInvitationPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const reason = sp.get('reason');

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          招待を確認できません
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {messageFor(reason)}
        </Alert>
        <Button variant="outlined" onClick={() => router.replace('/login')}>
          ログインへ戻る
        </Button>
      </Box>
    </Container>
  );
}
