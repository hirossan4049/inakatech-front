import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconLogout } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, type Tree } from '../api/client';
import MapComponent from '../components/MapComponent';
import TreeRegistrationForm from '../components/TreeRegistrationForm';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationFormOpened, setRegistrationFormOpened] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    <Container size={isMobile ? '100%' : 'md'} py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>ダッシュボード</Title>
          <Stack gap="sm" w={isMobile ? '100%' : 'auto'}>
            <Button
              variant="light"
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              ログアウト
            </Button>
          </Stack>
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
            <Box style={{ height: isMobile ? '300px' : '500px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <MapComponent
                trees={trees}
                apiKey={GOOGLE_MAPS_API_KEY}
                onTreeClick={handleTreeClick}
                onEmptyAreaClick={handleEmptyAreaClick}
              />
            </Box>
          )}
        </Stack>

        <TreeRegistrationForm
          opened={registrationFormOpened}
          onClose={() => {
            setRegistrationFormOpened(false);
            setSelectedCoordinates(undefined);
          }}
          onTreeCreated={handleTreeCreated}
          selectedCoordinates={selectedCoordinates}
        />
      </Stack>
    </Container>
  );
}