import { Plugin } from '../plugin'
import { ServerContext } from "../server"
import { cleanUrl, getShortName, normalizePath, removeImportQuery } from '../utils'

export function assetPlugin(): Plugin {
  let serverContext: ServerContext
  
  return {
    name: 'm-vite:asset',
    configureServer(s) {
      serverContext = s;
    },
    async load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id))
      const resolvedId = `/${getShortName(normalizePath(id), serverContext.root)}`

      if(cleanedId.endsWith('.svg')){
        return {
          code: `export default "${cleanedId}"`
        }
      }
    }
  }
}