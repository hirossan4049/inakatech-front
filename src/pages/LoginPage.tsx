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

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'ユーザー名を入力してください' : null),
      password: (value) => (value.length < 1 ? 'パスワードを入力してください' : null),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await login(values);
      notifications.show({
        title: 'ログイン成功',
        message: 'ようこそ！',
        color: 'green',
      });
      navigate('/');
    } catch (err) {
      setError('ログインに失敗しました。ユーザー名とパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        ログイン
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
              placeholder="パスワードを入力"
              required
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              ログイン
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt={10}>
          アカウントをお持ちでないですか？{' '}
          <Anchor component={Link} to="/register" size="sm">
            新規登録
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}