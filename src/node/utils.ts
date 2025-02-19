import path from 'path'
import { JS_TYPES_RE, HASH_RE, QEURY_RE } from './constants'

export const isJSRequest = (id: string): boolean => {
  id = cleanUrl(id)
  if (JS_TYPES_RE.test(id)) {
    return true
  }
  if (!path.extname(id) && !id.endsWith("/")) {
    return true
  }
  return false
}

export const isCSSRequest = (id: string): boolean => {
  return cleanUrl(id).endsWith('.css')
}

export const isImportRequest = (url: string): boolean => {
  return url.endsWith('?import')
}

export const getShortName = (file: string, root: string) => {
  return file.startsWith(root + '/') ? path.posix.relative(root, file) : file
}

export const cleanUrl = (url: string): string =>
  url.replace(HASH_RE, "").replace(QEURY_RE, "")