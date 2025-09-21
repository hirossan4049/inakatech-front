import { Container, Title, Text, Button, Stack, Group, TextInput, Textarea, Card, ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconArrowLeft, IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, type Tree } from '../api/client';
import { useMediaQuery } from '@mantine/hooks';

export default function JournalCreatePage() {
  const navigate = useNavigate();
  const { treeId } = useParams<{ treeId: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [treeLoading, setTreeLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  useEffect(() => {
    console.log('Speech Recognition Check:');
    console.log('window.SpeechRecognition:', 'SpeechRecognition' in window);
    console.log('window.webkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
    console.log('navigator.userAgent:', navigator.userAgent);

    // Chrome と Firefox 両方に対応
    const globalWindow = window as typeof window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };

    globalWindow.SpeechRecognition = globalWindow.webkitSpeechRecognition || globalWindow.SpeechRecognition;

    if (globalWindow.SpeechRecognition) {
      console.log('Speech Recognition API available');
      try {
        const recognitionInstance = new globalWindow.SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ja-JP';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setContent(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          notifications.show({
            title: 'エラー',
            message: `音声認識でエラーが発生しました: ${event.error}`,
            color: 'red',
          });
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
        console.log('Speech Recognition instance created successfully');
      } catch (error) {
        console.error('Failed to create Speech Recognition instance:', error);
      }
    } else {
      console.log('Speech Recognition API not available');
    }
  }, []);

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

  const toggleVoiceInput = () => {
    console.log('toggleVoiceInput called, recognition:', !!recognition);

    if (!recognition) {
      const globalWindow = window as typeof window & {
        SpeechRecognition?: typeof SpeechRecognition;
      };
      console.log('SpeechRecognition available:', !!globalWindow.SpeechRecognition);

      let message = 'このブラウザは音声認識をサポートしていません。';

      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        message += ' HTTPSが必要です。';
      }

      if (navigator.userAgent.includes('Firefox')) {
        message += ' Firefoxでは音声認識が制限されています。ChromeまたはEdgeを推奨します。';
      }

      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognition.stop();
      setIsListening(false);
    } else {
      console.log('Starting speech recognition');
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        notifications.show({
          title: 'エラー',
          message: '音声認識の開始に失敗しました',
          color: 'red',
        });
      }
    }
  };

  return (
    <Container size={isMobile ? '100%' : 'md'} py="xl">
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
              <Stack gap="xs">
                <Text fw={500}>対象の木:</Text>
                <Text>{`木 #${tree.id} (${tree.type})`}</Text>
                <Text size="sm" c="dimmed">{`緯度: ${tree.lat.toFixed(4)}, 経度: ${tree.lng.toFixed(4)}`}</Text>
              </Stack>

            <TextInput
              label="作業日"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.currentTarget.value)}
            />

            <Stack gap="xs">
              <Group justify="space-between" align="flex-end">
                <Text size="sm" fw={500}>
                  作業内容 <Text component="span" c="red">*</Text>
                </Text>
                {(recognition || (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition) && (
                  <Tooltip label={isListening ? "音声入力を停止" : "音声入力を開始"}>
                    <ActionIcon
                      variant={isListening ? "filled" : "light"}
                      color={isListening ? "red" : "blue"}
                      size="lg"
                      onClick={toggleVoiceInput}
                    >
                      {isListening ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
              <Textarea
                placeholder="作業内容や観察結果を詳しく記録してください（音声入力も可能です）"
                required
                minRows={8}
                value={content}
                onChange={(event) => setContent(event.currentTarget.value)}
                style={{
                  border: isListening ? '2px solid #fa5252' : undefined,
                }}
              />
              {isListening && (
                <Text size="xs" c="red" ta="center">
                  🎤 音声を認識中...
                </Text>
              )}
            </Stack>

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