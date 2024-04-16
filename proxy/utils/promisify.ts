export default async function promisify<T>(value: T | Promise<T>) {
  if (value instanceof Promise) {
    return await value
  } else {
    return value
  }
}
