import { NextHandleFunction } from "connect";
import { isImportRequest } from "../../utils";
// 加载静态资源的中间件
import sirv from "sirv";
import { CLIENT_PUBLIC_PATH } from "../../constants";

export function staticMiddleware(): NextHandleFunction {
  const serveFromRoot = sirv('/', { dev: true })
  return async (req, res, next) => {
    if (!req.url) {
      return
    }
    // 不处理import请求
    if (isImportRequest(req.url) || req.url === CLIENT_PUBLIC_PATH) {
      return
    }
    serveFromRoot(req, res, next)
  }
}