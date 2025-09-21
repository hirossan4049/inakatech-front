import { Modal, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTree, IconCopy, IconCheck, IconNfc } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { apiClient, type Tree } from '../api/client';

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
  }, [form]);


  const handleSubmit = async (values: TreeFormData) => {
    try {
      const newTree = await apiClient.createTree({
        type: values.type,
        lat: selectedCoordinates.lat,
        lng: selectedCoordinates.lng,
      });

      // Save tree type to localStorage for next time
      localStorage.setItem('lastTreeType', values.type);

      // Create detail URL
      const detailUrl = `${window.location.origin}/tree/${newTree.id}`;
      const nfcUrl = `simplynfc://writer?url=${encodeURIComponent(detailUrl)}`;

      // Try to open SimplyNFC app first, then fallback to clipboard
      try {
        // Attempt to open NFC app
        window.location.href = nfcUrl;

        // Also copy to clipboard as backup
        await navigator.clipboard.writeText(detailUrl);

        notifications.show({
          title: '成功',
          message: (
            <Stack gap="xs">
              <Text>木が正常に登録されました</Text>
              <Group gap="xs">
                <IconNfc size={16} color="blue" />
                <Text size="sm">NFCアプリを開いています...</Text>
              </Group>
              <Group gap="xs">
                <IconCheck size={16} color="green" />
                <Text size="sm">詳細URLをクリップボードにコピーしました</Text>
              </Group>
              <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                {detailUrl}
              </Text>
            </Stack>
          ),
          color: 'green',
          autoClose: 8000,
        });
      } catch (error) {
        // Fallback if NFC app or clipboard fails
        try {
          await navigator.clipboard.writeText(detailUrl);
          notifications.show({
            title: '成功',
            message: (
              <Stack gap="xs">
                <Text>木が正常に登録されました</Text>
                <Group gap="xs">
                  <IconCheck size={16} color="green" />
                  <Text size="sm">詳細URLをクリップボードにコピーしました</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {detailUrl}
                </Text>
              </Stack>
            ),
            color: 'green',
            autoClose: 8000,
          });
        } catch (clipboardError) {
          // Final fallback - just show the URL
          notifications.show({
            title: '成功',
            message: (
              <Stack gap="xs">
                <Text>木が正常に登録されました</Text>
                <Group gap="xs">
                  <IconCopy size={16} />
                  <Text size="sm">詳細URL:</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                  {detailUrl}
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
    } catch (error) {
      console.error('Failed to create tree:', error);
      notifications.show({
        title: 'エラー',
        message: '木の登録に失敗しました',
        color: 'red',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

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
            <Button type="submit" loading={form.isSubmitting}>
              登録
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}