import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
global.console = {
  ...global.console,
}
