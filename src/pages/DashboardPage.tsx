import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    notifications.show({
      title: 'ログアウト',
      message: 'ログアウトしました',
      color: 'blue',
    });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>ダッシュボード</Title>
          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </Group>

        <Text size="lg" c="dimmed">
          ログインが成功しました！ここから木の管理やLiDARファイルの管理、作業日誌の記録ができます。
        </Text>

        <Stack gap="md">
          <Title order={3}>利用可能な機能</Title>
          <Text>• 木の登録と管理</Text>
          <Text>• LiDARファイルのアップロードと管理</Text>
          <Text>• 作業日誌の記録と閲覧</Text>
        </Stack>
      </Stack>
    </Container>
  );
}