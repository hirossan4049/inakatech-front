import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export default function App() {
  return (
    <Container size="sm" p="lg">
      <Stack gap="md">
        <Title order={2}>Bun + React + Mantine + Biome</Title>
        <Text c="dimmed">
          最小セットでモダンな開発体験。Biomeでコードを一貫化し、MantineでUIを素早く。
        </Text>
        <Group>
          <Button>Primary</Button>
          <Button variant="light" leftSection={<IconBrandGithub size={18} />}>
            GitHub
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
