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

  return (
    <Button color="gray" variant="subtle" onClick={onToggle}>
      {computedScheme === 'light' ? <IconSun /> : <IconMoon />}
    </Button>
  )
}
