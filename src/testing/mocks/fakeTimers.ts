import * as SinonTimers from '@sinonjs/fake-timers'

type UseOptions = {
  shouldAdvancedTime?: boolean
}

const defaultOptions: Required<UseOptions> = {
  shouldAdvancedTime: true,
}

function use(
  callback: (clock: SinonTimers.Clock) => void,
  useOptions?: UseOptions,
): void
function use(
  callback: (clock: SinonTimers.Clock) => Promise<void>,
  useOptions?: UseOptions,
): Promise<void>
function use(
  callback: (clock: SinonTimers.Clock) => void | Promise<void>,
  useOptions: UseOptions = {},
): unknown {
  const options: Required<UseOptions> = { ...defaultOptions, ...useOptions }

  const clock = SinonTimers.install({
    shouldClearNativeTimers: true,
    shouldAdvanceTime: options.shouldAdvancedTime,
  })

  try {
    const result = callback(clock)

    if (result instanceof Promise) {
      return result.finally(() => clock.uninstall())
    } else {
      clock.uninstall()
    }
  } catch (err) {
    clock.uninstall()
    throw err
  }
}

export const FakeTimers = {
  use,
}
