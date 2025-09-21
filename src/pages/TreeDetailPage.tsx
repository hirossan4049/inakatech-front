import { ActionIcon, Badge, Box, Button, Card, Container, Grid, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCalendar, IconFile, IconMapPin, IconPlus, IconTree } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, type Tree, type WorkLog } from '../api/client';
import { ModelViewer } from '../components/ModelViewer';

export default function TreeDetailPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<Tree | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchTreeData = async () => {
      if (!treeId) return;

      try {
        setLoading(true);
        const [treeData, workLogsData] = await Promise.all([
          apiClient.getTree(Number(treeId)),
          apiClient.getWorkLogs(Number(treeId))
        ]);
        setTree(treeData);
        setWorkLogs(workLogsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tree data:', err);
        setError('木の詳細情報の取得に失敗しました');
        notifications.show({
          title: 'エラー',
          message: '木の詳細情報の取得に失敗しました',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [treeId]);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>読み込み中...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !tree) {
    return (
      <Container size="md" py="xl">
        <Stack gap="lg" align="center">
          <Text c="red" size="lg">{error || '木が見つかりません'}</Text>
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
            ダッシュボードに戻る
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      {/* Full-width 3D viewer without extra margins */}
      <Box style={{ height: '50vh', width: '100%' }}>
        <ModelViewer
          src={'/sample.glb'}
          iosSrc={tree.lidar_url || '/sample.usdz'}
          alt="Tree USDZ Model"
          ar
          arModes="quick-look"
          cameraTarget="0m -0.2m 0m"
          style={{ width: '100%', height: '100%', display: 'block', background: 'transparent', border: 'none' }}
        />
      </Box>

      {/* Floating back button bottom-left */}
      <ActionIcon
        onClick={() => navigate('/')}
        variant="filled"
        color="gray"
        radius="xl"
        size="xl"
        style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 2000 }}
        aria-label="戻る"
      >
        <IconArrowLeft size={20} />
      </ActionIcon>

      <Container size={isMobile ? '100%' : 'md'} py="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={2}>
                <Group gap="sm">
                  <IconTree size={32} color="green" />
                  {tree.type}
                </Group>
              </Title>
              <Badge size="lg" variant="light">
                ID: {tree.id}
              </Badge>
            </Group>

            <Grid>
              <Grid.Col span={isMobile ? 12 : 6}>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text fw={500}>緯度:</Text>
                  <Text>{tree.lat}</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={isMobile ? 12 : 6}>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text fw={500}>経度:</Text>
                  <Text>{tree.lng}</Text>
                </Group>
              </Grid.Col>
            </Grid>

            <Group gap="xs">
              <IconFile size={16} />
              <Text fw={500}>LiDAR:</Text>
              {tree.lidar_url ? (
                <Badge color="green">あり</Badge>
              ) : (
                <Badge color="gray">なし</Badge>
              )}
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>
                <Group gap="sm">
                  <IconCalendar size={24} />
                  作業日誌
                </Group>
              </Title>
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(`/tree/${tree.id}/create`)}
              >
                日誌追加
              </Button>
            </Group>

            {workLogs.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                作業日誌はまだありません
              </Text>
            ) : (
              <Stack gap="sm">
                {workLogs.map((log) => (
                  <Card key={log.id} padding="md" radius="sm" withBorder>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={500}>{log.date}</Text>
                        <Badge variant="light" size="sm">
                          ID: {log.id}
                        </Badge>
                      </Group>
                      <Text>{log.description}</Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </Container>
    </>
  );
}
