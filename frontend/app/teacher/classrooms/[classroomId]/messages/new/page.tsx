'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Box, Typography, TextField, Button, Alert, Stack
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { apiFetch } from '@/lib/api';

type CreateMessageResponse = { data: { id: number } };
type Student = { id: number; name: string; email: string };

export default function MessageNewPage() {
  const { id: classroomId } = useParams<{ id: string }>();
  const router = useRouter();

  // フォーム
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadlineLocal, setDeadlineLocal] = useState(''); // 'YYYY-MM-DDTHH:mm'

  // 作成結果
  const [messageId, setMessageId] = useState<number | null>(null);

  // 送付先
  const [students, setStudents] = useState<Student[]>([]);
  const [targetAll, setTargetAll] = useState<boolean>(true);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // UI状態
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 学生一覧取得
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/classrooms/${classroomId}/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json().catch(() => ({}));
        const list: Student[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json) ? json : [];
        setStudents(list);
      } catch (e: any) {
        setErr(`生徒一覧の取得に失敗しました：${e?.message ?? e}`);
      }
    })();
  }, [classroomId]);

  function toISOFromLocal(datetimeLocal: string): string | undefined {
    if (!datetimeLocal) return undefined;
    const d = new Date(datetimeLocal);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  // 下書き作成
  async function createMessage() {
    setErr(null); setFlash(null);
    if (!title.trim()) { setErr('タイトルは必須です'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, any> = { title: title.trim(), content };
      const iso = toISOFromLocal(deadlineLocal);
      if (iso) body.deadline = iso;

      const res = await apiFetch(`/classrooms/${classroomId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: body }),
        // headers: { 'Content-Type': 'application/json' }, // apiFetchが付けない場合のみ
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.errors?.join?.('\n') ?? errJson?.message ?? `HTTP ${res.status}`);
      }

      const payload = (await res.json()) as CreateMessageResponse;
      const id = payload?.data?.id;
      if (!id) throw new Error('作成レスポンスにIDが含まれていません');

      setMessageId(id);
      setFlash('下書きを作成しました。送付先を選んで公開できます。');
    } catch (e: any) {
      setErr(e?.message ?? '下書き作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  // 公開
  async function publishMessage() {
    if (!messageId) return;
    setErr(null); setFlash(null);

    if (!targetAll && selectedStudents.length === 0) {
      setErr('送付先が未選択です（全員に送る をONにするか、個別選択してください）');
      return;
    }

    setPublishing(true);
    try {
      const msgParam = targetAll
        ? { target_all: true }
        : { recipient_ids: selectedStudents.map(s => s.id) };

      const res = await apiFetch(
        `/classrooms/${classroomId}/messages/${messageId}/publish`,
        {
          method: 'POST',
          body: JSON.stringify({ message: msgParam }),
          // headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.errors?.join?.('\n') ?? errJson?.message ?? `HTTP ${res.status}`);
      }

      setFlash('公開しました。');
      router.replace(`/classrooms/${classroomId}/messages/${messageId}`);
    } catch (e:any) {
      setErr(e?.message ?? '公開に失敗しました');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Container maxWidth="md">
      <Box mt={6} mb={3}>
        <Typography variant="h4">お便り作成</Typography>
        <Typography color="text.secondary">クラスID：{classroomId}</Typography>
      </Box>

      {flash && <Alert severity="success" sx={{ mb:2, whiteSpace:'pre-line' }}>{flash}</Alert>}
      {err && <Alert severity="error" sx={{ mb:2, whiteSpace:'pre-line' }}>{err}</Alert>}

      <Stack spacing={2}>
        <TextField
          label="タイトル"
          fullWidth
          value={title}
          onChange={e=>setTitle(e.target.value)}
          inputProps={{ maxLength: 120 }}
          required
        />
        <TextField
          label="本文"
          fullWidth
          multiline
          minRows={6}
          value={content}
          onChange={e=>setContent(e.target.value)}
        />
        <TextField
          label="回答期限（任意）"
          type="datetime-local"
          fullWidth
          value={deadlineLocal}
          onChange={e=>setDeadlineLocal(e.target.value)}
          helperText="未指定可。指定した場合は公開後の締切判定に使用します。"
        />

        {/* 送付先選択 */}
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Switch checked={targetAll} onChange={(e)=>setTargetAll(e.target.checked)} />}
            label="全員に送る"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
            {targetAll
              ? 'このメッセージはクラス全員に配信されます。'
              : '配信先の生徒を選択してください。'}
          </Typography>

          <Autocomplete
            multiple
            disableCloseOnSelect
            options={students}
            value={selectedStudents}
            onChange={(_, v)=>setSelectedStudents(v)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={(s)=> `${s.name} <${s.email}>`}
            disabled={targetAll}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} key={option.id}/>
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="個別送付先（全員に送るがOFFのとき有効）"
                placeholder="生徒を検索して選択"
                helperText={!targetAll ? `選択中: ${selectedStudents.length}名` : ' '}
              />
            )}
            sx={{ mt: 1 }}
          />
        </Box>

        <Box>
          <Button
            variant="contained"
            onClick={createMessage}
            sx={{ mr:2 }}
            disabled={submitting}
          >
            {submitting ? '作成中…' : '下書きを作成'}
          </Button>
          <Button
            variant="outlined"
            onClick={publishMessage}
            disabled={!messageId || publishing || (!targetAll && selectedStudents.length === 0)}
          >
            {publishing ? '公開中…' : '公開'}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
