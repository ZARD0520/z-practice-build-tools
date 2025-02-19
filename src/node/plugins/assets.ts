import { Plugin } from '../plugin'
import { cleanUrl, removeImportQuery } from '../utils'

export function assetPlugin(): Plugin {
  return {
    name: 'm-vite:asset',
    async load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id))
      if(cleanedId.endsWith('.svg')){
        return {
          code: `export default "${cleanedId}"`
        }
      }
    }
  }
}