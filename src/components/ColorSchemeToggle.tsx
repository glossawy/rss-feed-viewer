import {
  Button,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useCallback } from 'react'

export default function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computedScheme = useComputedColorScheme('dark')

  const onToggle = useCallback(() => {
    setColorScheme(computedScheme === 'light' ? 'dark' : 'light')
  }, [computedScheme, setColorScheme])

  const description =
    computedScheme === 'light'
      ? 'Currently in light mode, click to change to dark mode'
      : 'Currently in dark mode, click to change to light mode'

  return (
    <Button
      color="gray"
      variant="subtle"
      onClick={onToggle}
      title={description}
    >
      {computedScheme === 'light' ? <IconSun /> : <IconMoon />}
    </Button>
  )
}
