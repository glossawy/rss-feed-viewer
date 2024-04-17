import { Button } from '@mantine/core'
import { IconShare, IconShareOff } from '@tabler/icons-react'
import { useCallback } from 'react'

import { useRequestProxy } from '@app/hooks/requestProxy'

export default function ProxyingToggle() {
  const { isProxying, setUseProxy } = useRequestProxy()

  const onClick = useCallback(() => {
    setUseProxy(!isProxying)
  }, [isProxying, setUseProxy])

  const description = isProxying
    ? 'Requests for feeds are being proxied through the server, click to disable'
    : 'Requests for feeds are being sent directly from your browser, click to use proxy server'

  return (
    <Button variant="subtle" color="gray" onClick={onClick} title={description}>
      {isProxying ? <IconShare /> : <IconShareOff />}
    </Button>
  )
}
