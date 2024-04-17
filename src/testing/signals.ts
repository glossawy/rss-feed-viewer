export type Signal = PromiseLike<void> & { send: () => void }

export function createOneShotSignal(): Signal {
  let sendSignal

  const signal: Partial<Signal> = new Promise((resolve) => {
    sendSignal = resolve
  })

  signal.send = sendSignal

  return signal as Signal
}
