import BaseTool from './base.js'
// 画笔工具
class PenTool extends BaseTool {
  constructor() {
    super('pen', '画笔', '🖊️')
    this.isDrawing = false
  }

  onActivate(ctx, globalConfig) {
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  onStart(ctx, pos, globalConfig) {
    this.isDrawing = true
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = globalConfig.color
    ctx.lineWidth = globalConfig.size
  }

  onMove(ctx, pos, globalConfig) {
    if (!this.isDrawing) return
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  onEnd(ctx, pos, globalConfig) {
    this.isDrawing = false
    ctx.beginPath()
  }
}


export default PenTool;