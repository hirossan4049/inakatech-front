import { Container, Title, Text, Button, Stack, Group, TextInput, Textarea, Card } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, type Tree } from '../api/client';

export default function JournalCreatePage() {
  const navigate = useNavigate();
  const { treeId } = useParams<{ treeId: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      if (!treeId) return;

      try {
        setTreeLoading(true);
        const treeData = await apiClient.getTree(parseInt(treeId));
        setTree(treeData);
      } catch (error) {
        console.error('Failed to fetch tree:', error);
        notifications.show({
          title: 'エラー',
          message: '木のデータの取得に失敗しました',
          color: 'red',
        });
      } finally {
        setTreeLoading(false);
      }
    };

    fetchTree();
  }, [treeId]);

  const handleSave = async () => {
    if (!treeId || !content.trim()) {
      notifications.show({
        title: 'エラー',
        message: '作業内容は必須です',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.createWorkLog(parseInt(treeId), {
        date,
        description: content,
      });

      notifications.show({
        title: '保存完了',
        message: '作業日誌を保存しました',
        color: 'green',
      });

      navigate(`/tree/${treeId}`);
    } catch (error) {
      console.error('Failed to save work log:', error);
      notifications.show({
        title: 'エラー',
        message: '作業日誌の保存に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>新規日誌作成</Title>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(treeId ? `/tree/${treeId}` : '/dashboard')}
          >
            戻る
          </Button>
        </Group>

        <Text size="lg" c="dimmed">
          特定の木に対する作業記録や観察結果を記録しましょう。
        </Text>

        {treeLoading ? (
          <Text>読み込み中...</Text>
        ) : tree ? (
          <Card withBorder shadow="sm" padding="lg">
            <Stack gap="md">
              <Group gap="sm">
                <Text fw={500}>対象の木:</Text>
                <Text>{`木 #${tree.id} (${tree.type}) - ${tree.lat.toFixed(4)}, ${tree.lng.toFixed(4)}`}</Text>
              </Group>

            <TextInput
              label="作業日"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.currentTarget.value)}
            />

            <Textarea
              label="作業内容"
              placeholder="作業内容や観察結果を詳しく記録してください"
              required
              minRows={8}
              value={content}
              onChange={(event) => setContent(event.currentTarget.value)}
            />

              <Group justify="flex-end">
                <Button
                  variant="filled"
                  color="green"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSave}
                  loading={loading}
                >
                  保存
                </Button>
              </Group>
            </Stack>
          </Card>
        ) : (
          <Text c="red">木が見つかりません</Text>
        )}
      </Stack>
    </Container>
  );
}