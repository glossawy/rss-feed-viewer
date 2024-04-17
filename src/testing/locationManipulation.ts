import { act, fireEvent } from '@testing-library/react'

export function createDocumentPathname(urlParam: string) {
  return `/?url=${encodeURIComponent(urlParam)}`
}

export function createDocumentUrl(urlParam: string) {
  return `${window.testing.testUrl}${createDocumentPathname(urlParam)}`
}

export function setDocumentUrl(urlParam: string) {
  location.href = createDocumentUrl(urlParam)
}

export function simulateNavigateBack(urlParam: string) {
  setDocumentUrl(urlParam)
  act(() => {
    fireEvent.popState(window)
  })
}
