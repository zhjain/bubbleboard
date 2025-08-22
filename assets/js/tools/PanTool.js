import BaseTool from './base.js'

// 平移工具（画布平移）
class PanTool extends BaseTool {
  constructor() {
    super('pan', '平移', '✋')
    this.isDragging = false
    this.lastPos = null
  }

  onActivate(ctx, globalConfig) {
    // 激活时改变画布光标
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      canvas.style.cursor = 'grab'
    }
  }

  onStart(ctx, pos, globalConfig) {
    this.isDragging = true
    this.lastPos = { ...pos }
    
    // 改变光标为抓取状态
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      canvas.style.cursor = 'grabbing'
    }
  }

  onMove(ctx, pos, globalConfig) {
    if (!this.isDragging || !this.lastPos) return

    const deltaX = pos.x - this.lastPos.x
    const deltaY = pos.y - this.lastPos.y

    // 使用视口系统平移
    if (window.viewport) {
      window.viewport.pan(deltaX, deltaY)
    }

    this.lastPos = { ...pos }
  }

  onEnd(ctx, pos, globalConfig) {
    this.isDragging = false
    this.lastPos = null
    
    // 恢复光标
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      canvas.style.cursor = 'grab'
    }
  }

  getCursor() {
    return this.isDragging ? 'grabbing' : 'grab'
  }

  getToolConfig() {
    return []
  }
}

export default PanTool