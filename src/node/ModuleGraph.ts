import { PartialResolvedId, TransformResult } from "rollup";
import { cleanUrl } from "./utils";

export class ModuleNode {
  url: string // 资源访问url
  id: string | null = null // 资源绝对路径
  importers = new Set<ModuleNode>()
  importedModules = new Set<ModuleNode>()
  transformResult: TransformResult | null = null
  lastHMRTimestamp = 0
  constructor(url: string) {
    this.url = url
  }
}

export class ModuleGraph {
  // url到ModuleNode的映射表
  urlToModuleMap = new Map<string, ModuleNode>()
  // 绝对路径到ModuleNode的映射表
  idToModuleMap = new Map<string, ModuleNode>()

  constructor(private resolveId: (url: string) => Promise<PartialResolvedId | null>) { }

  getModuleById(id: string): ModuleNode | undefined {
    return this.idToModuleMap.get(id)
  }

  async getModuleByUrl(rawUrl: string): Promise<ModuleNode | undefined> {
    const { url } = await this._resolve(rawUrl)
    return this.urlToModuleMap.get(url)
  }

  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
    const { url, resolvedId } = await this._resolve(rawUrl)
    // 检查缓存
    if (this.urlToModuleMap.has(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode
    }
    // 若无缓存，更新urlToModuleMap 和 idToModuleMap
    const mod = new ModuleNode(url)
    mod.id = resolvedId
    this.urlToModuleMap.set(url, mod)
    this.idToModuleMap.set(resolvedId, mod)
    return mod
  }

  async updateModuleInfo(mod: ModuleNode, importedModules: Set<string | ModuleNode>) {
    const prevImports = mod.importedModules
    for (const curImports of importedModules) {
      const dep = typeof curImports === 'string' ? await this.ensureEntryFromUrl(cleanUrl(curImports)) : curImports
      if (dep) {
        mod.importedModules.add(dep)
        dep.importers.add(mod)
      }
    }
    // 清除不再被引用的依赖
    for (const prevImport of prevImports) {
      if (!importedModules.has(prevImport.url)) {
        prevImport.importers.delete(mod)
      }
    }
  }

  // HMR 触发时执行
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file)
    if (mod) {
      // 更新时间戳
      mod.lastHMRTimestamp = Date.now()
      mod.transformResult = null
      mod.importers.forEach((importer) => {
        this.invalidateModule(importer.id!)
      })
    }
  }

  private async _resolve(url: string): Promise<{ url: string; resolvedId: string }> {
    const resolved = await this.resolveId(url)
    const resolvedId = resolved?.id || url
    return { url, resolvedId }
  }
}