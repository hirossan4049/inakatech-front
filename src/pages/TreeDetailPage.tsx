import { Container, Title, Text, Button, Stack, Group, Box, Card, Grid, Badge, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconMapPin, IconTree, IconFile, IconCalendar, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, type Tree, type WorkLog } from '../api/client';

export default function TreeDetailPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<Tree | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/')}
          >
            戻る
          </Button>
        </Group>

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
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text fw={500}>緯度:</Text>
                  <Text>{tree.lat}</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
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
      </Stack>
    </Container>
  );
}