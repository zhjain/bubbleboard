class BaseTool {
  constructor(id, name, icon, config = {}) {
    this.id = id
    this.name = name
    this.icon = icon
    this.config = config
  }

  // 工具激活时调用
  onActivate(ctx, globalConfig) {}

  // 开始绘制/操作
  onStart(ctx, pos, globalConfig) {}

  // 移动过程中
  onMove(ctx, pos, globalConfig) {}

  // 结束绘制/操作
  onEnd(ctx, pos, globalConfig) {}

  // 获取鼠标样式
  getCursor() {
    return 'crosshair'
  }

  // 是否需要颜色配置
  needsColor() {
    return true
  }

  // 是否需要尺寸配置
  needsSize() {
    return true
  }

  // 获取工具特定配置
  getToolConfig() {
    return []
  }
}

export default BaseTool
