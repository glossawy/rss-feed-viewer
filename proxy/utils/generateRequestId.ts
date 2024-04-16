export default function generateHexId(): string {
  const buffer = Buffer.alloc(16)
  crypto.getRandomValues(buffer)

  return buffer.toString('hex')
}
