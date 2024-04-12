import { FeedContext } from '@app/contexts/feed'
import { useContext } from 'react'

export function useFeed() {
  return useContext(FeedContext)
}
