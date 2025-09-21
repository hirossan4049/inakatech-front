import { Container, Title, Text, Button, Stack, Group, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLogout, IconPlus } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import MapComponent from '../components/MapComponent';
import TreeRegistrationForm from '../components/TreeRegistrationForm';
import { apiClient, type Tree } from '../api/client';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationFormOpened, setRegistrationFormOpened] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | undefined>();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleTreeClick = useCallback((tree: Tree) => {
    navigate(`/tree/${tree.id}`);
  }, [navigate]);

  const handleTreeCreated = useCallback((newTree: Tree) => {
    setTrees(prev => [...prev, newTree]);
  }, []);

  const handleEmptyAreaClick = useCallback((lat: number, lng: number) => {
    // Set coordinates and open registration modal directly
    setSelectedCoordinates({ lat, lng });
    setRegistrationFormOpened(true);
  }, []);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        const treesData = await apiClient.getTrees();
        setTrees(treesData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trees:', err);
        setError('木のデータの取得に失敗しました');
        notifications.show({
          title: 'エラー',
          message: '木のデータの取得に失敗しました',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

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
          <Group gap="sm">
            <Button
              variant="filled"
              color="green"
              leftSection={<IconPlus size={16} />}
              onClick={() => setRegistrationFormOpened(true)}
            >
              木を登録
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              ログアウト
            </Button>
          </Group>
        </Group>

        <Text size="lg" c="dimmed">
          ここから木の管理やLiDARファイルの管理、作業日誌の記録ができます。
        </Text>

        <Stack gap="md">
          <Title order={3}>木の位置マップ</Title>
          {loading ? (
            <Text>読み込み中...</Text>
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : (
            <Box style={{ height: '500px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <MapComponent
                trees={trees}
                apiKey={GOOGLE_MAPS_API_KEY}
                onTreeClick={handleTreeClick}
                onEmptyAreaClick={handleEmptyAreaClick}
              />
            </Box>
          )}
        </Stack>

        <Stack gap="md">
          <Title order={3}>利用可能な機能</Title>
          <Text>• 木の登録と管理</Text>
          <Text>• LiDARファイルのアップロードと管理</Text>
          <Text>• 作業日誌の記録と閲覧</Text>
        </Stack>

        {selectedCoordinates && (
          <TreeRegistrationForm
            opened={registrationFormOpened}
            onClose={() => {
              setRegistrationFormOpened(false);
              setSelectedCoordinates(undefined);
            }}
            onTreeCreated={handleTreeCreated}
            selectedCoordinates={selectedCoordinates}
          />
        )}
      </Stack>
    </Container>
  );
}