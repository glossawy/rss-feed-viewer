import { useContext } from 'react'

import { RequestProxyContext } from '@app/contexts/requestProxy'

export function useRequestProxy() {
  return useContext(RequestProxyContext)
}
