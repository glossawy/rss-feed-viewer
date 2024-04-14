import { readFileSync } from 'fs'

import rssXmlPath from './rss.xml?raw'

export const Fixtures = {
  rssXml: readFileSync(rssXmlPath).toString('utf8'),
}
