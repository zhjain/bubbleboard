import BaseTool from './base.js'
// 橡皮擦工具
class EraserTool extends BaseTool {
  constructor() {
    super('eraser', '橡皮擦', 'ph:eraser')
    this.isErasing = false
  }

  onActivate(ctx, globalConfig) {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  onStart(ctx, pos, globalConfig) {
    this.isErasing = true
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineWidth = globalConfig.size
  }

  onMove(ctx, pos, globalConfig) {
    if (!this.isErasing) return
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  onEnd(ctx, pos, globalConfig) {
    this.isErasing = false
    ctx.beginPath()
  }

  getCursor() {
    return 'grab'
  }

  needsColor() {
    return false
  }
}

export default EraserTool
