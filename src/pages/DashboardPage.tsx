import { ActionIcon, Box, Drawer, Group, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconLogout, IconMenu2 } from '@tabler/icons-react';
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
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
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
    closeDrawer();
    notifications.show({
      title: 'ログアウト',
      message: 'ログアウトしました',
      color: 'blue',
    });
  };

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Group justify="flex-end" p="md" style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}>
        <ActionIcon variant="filled" color="gray" size="lg" onClick={toggleDrawer}>
          <IconMenu2 size={18} />
        </ActionIcon>
      </Group>

      <Box style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <Box style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text>読み込み中...</Text>
          </Box>
        ) : error ? (
          <Box style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text c="red">{error}</Text>
          </Box>
        ) : (
          <MapComponent
            trees={trees}
            apiKey={GOOGLE_MAPS_API_KEY}
            onTreeClick={handleTreeClick}
            onEmptyAreaClick={handleEmptyAreaClick}
          />
        )}
      </Box>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="ダッシュボード"
        position="right"
        size="sm"
        withCloseButton={true}
      >
        <Stack gap="lg">
          <Text size="lg" c="dimmed">
            ここから木の管理やLiDARファイルの管理、作業日誌の記録ができます。
          </Text>

          <ActionIcon
            variant="light"
            color="red"
            onClick={handleLogout}
            size="lg"
            style={{ alignSelf: 'flex-start' }}
          >
            <IconLogout size={18} />
          </ActionIcon>
        </Stack>
      </Drawer>

      <TreeRegistrationForm
        opened={registrationFormOpened}
        onClose={() => {
          setRegistrationFormOpened(false);
          setSelectedCoordinates(undefined);
        }}
        onTreeCreated={handleTreeCreated}
        selectedCoordinates={selectedCoordinates || { lat: 0, lng: 0 }}
      />
    </Box>
  );
}