import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Anchor,
  Text,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'ユーザー名を入力してください' : null),
      password: (value) => (value.length < 6 ? 'パスワードは6文字以上で入力してください' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'パスワードが一致しません' : null,
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await register({
        username: values.username,
        password: values.password,
      });

      notifications.show({
        title: '登録成功',
        message: `アカウントが作成されました。ログインページに移動します。`,
        color: 'green',
      });

      navigate('/login');
    } catch (err) {
      setError('登録に失敗しました。ユーザー名が既に使用されている可能性があります。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        新規登録
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert variant="light" color="red" icon={<IconInfoCircle size={16} />}>
                {error}
              </Alert>
            )}

            <TextInput
              label="ユーザー名"
              placeholder="ユーザー名を入力"
              required
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="パスワード"
              placeholder="パスワードを入力（6文字以上）"
              required
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label="パスワード確認"
              placeholder="パスワードを再入力"
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              アカウント作成
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt={10}>
          既にアカウントをお持ちですか？{' '}
          <Anchor component={Link} to="/login" size="sm">
            ログイン
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}