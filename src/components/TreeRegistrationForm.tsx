import { Modal, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTree, IconCheck, IconNfc, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { apiClient, type Tree } from '../api/client';
import { useMediaQuery } from '@mantine/hooks';

interface TreeRegistrationFormProps {
  opened: boolean;
  onClose: () => void;
  onTreeCreated: (tree: Tree) => void;
  selectedCoordinates: { lat: number; lng: number };
}

interface TreeFormData {
  type: string;
}

export default function TreeRegistrationForm({ opened, onClose, onTreeCreated, selectedCoordinates }: TreeRegistrationFormProps) {
  const [lastTreeType, setLastTreeType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const form = useForm<TreeFormData>({
    initialValues: {
      type: '',
    },
    validate: {
      type: (value) => (!value ? '木の種類を入力してください' : null),
    },
  });

  // Load last tree type from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastTreeType');
    if (saved) {
      setLastTreeType(saved);
      form.setFieldValue('type', saved);
    }
  }, []);


  const handleSubmit = async (values: TreeFormData) => {
    setIsSubmitting(true);
    try {
      const newTree = await apiClient.createTree({
        type: values.type,
        lat: selectedCoordinates.lat,
        lng: selectedCoordinates.lng,
      });

      // Save tree type to localStorage for next time
      localStorage.setItem('lastTreeType', values.type);

      // Create URLs
      const detailUrl = `${window.location.origin}/tree/${newTree.id}`;
      const journalCreateUrl = `${window.location.origin}/tree/${newTree.id}/create`;
      const nfcUrl = `simplynfc://writer?url=${encodeURIComponent(journalCreateUrl)}`;

      // Try to open SimplyNFC app first, then fallback to clipboard
      try {
        // Attempt to open NFC app
        window.location.href = nfcUrl;

        // Copy journal creation URL to clipboard as backup
        await navigator.clipboard.writeText(journalCreateUrl);

        notifications.show({
          title: '木の登録完了',
          message: (
            <Stack gap="md">
              <Text fw={500}>木 #{newTree.id} ({newTree.type}) が正常に登録されました</Text>

              <Stack gap="xs">
                <Group gap="xs">
                  <IconNfc size={16} color="blue" />
                  <Text size="sm" fw={500}>NFC設定</Text>
                </Group>
                <Text size="xs" c="dimmed">
                  NFCアプリを開いています...日誌作成用URLを書き込んでください
                </Text>
                <Text size="xs" c="blue" style={{ wordBreak: 'break-all', backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '4px' }}>
                  {journalCreateUrl}
                </Text>
              </Stack>

              <Stack gap="xs">
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm" fw={500}>クリップボード</Text>
                </Group>
                <Text size="xs" c="dimmed">
                  日誌作成URLをコピーしました
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={500}>参考: 木の詳細ページ</Text>
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {detailUrl}
                </Text>
              </Stack>
            </Stack>
          ),
          color: 'green',
          autoClose: 12000,
        });
      } catch {
        // Fallback if NFC app or clipboard fails
        try {
          await navigator.clipboard.writeText(journalCreateUrl);
          notifications.show({
            title: '成功',
            message: (
              <Stack gap="xs">
                <Text>木が正常に登録されました</Text>
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">日誌作成URLをクリップボードにコピーしました</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {journalCreateUrl}
                </Text>
              </Stack>
            ),
            color: 'green',
            autoClose: 8000,
          });
        } catch {
          // Final fallback - just show the URL
          notifications.show({
            title: '成功',
            message: (
              <Stack gap="xs">
                <Text>木が正常に登録されました</Text>
                <Group gap="xs">
                  <IconCopy size={16} />
                  <Text size="sm">日誌作成URL:</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {journalCreateUrl}
                </Text>
              </Stack>
            ),
            color: 'green',
            autoClose: 10000,
          });
        }
      }

      onTreeCreated(newTree);
      form.reset();
      onClose();
    } catch (err) {
      console.error('Failed to create tree:', err);
      notifications.show({
        title: 'エラー',
        message: '木の登録に失敗しました',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!selectedCoordinates) {
    return (
      <Modal opened={opened} onClose={handleClose} title="場所を選択してください" centered>
        <Text ta="center" p="md">
          マップをクリックして、木を登録する場所を選んでください。
        </Text>
        <Group justify="center">
          <Button onClick={handleClose}>閉じる</Button>
        </Group>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <IconTree size={20} color="green" />
          新しい木を登録
        </Group>
      }
      size="md"
      fullScreen={isMobile}
      radius={isMobile ? 0 : undefined}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              位置: 緯度 {selectedCoordinates.lat.toFixed(6)}, 経度 {selectedCoordinates.lng.toFixed(6)}
            </Text>
          </div>

          <TextInput
            label="木の種類"
            placeholder="例: 桜、松、オーク、楓"
            required
            leftSection={<IconTree size={16} />}
            {...form.getInputProps('type')}
          />

          {lastTreeType && (
            <Text size="xs" c="dimmed">
              前回入力: {lastTreeType}
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" loading={isSubmitting}>
              登録
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}