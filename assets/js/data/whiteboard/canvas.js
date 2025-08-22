export default function canvasData() {
  return {
    canvas: null,
    ctx: null,
    globalConfig: {
      color: '#000000',
      size: 2,
      opacity: 100,
      // 形状工具配置
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      cornerRadius: 0,
      rotation: 0,
      skewAngle: 15,
    },

    initCanvas() {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d')
      this.resizeCanvas()

      window.addEventListener('resize', () => this.resizeCanvas())
    },

    resizeCanvas() {
      const container = this.canvas.parentElement
      this.canvas.width = container.clientWidth
      this.canvas.height = container.clientHeight
    },

    handleStart(e) {
      e.preventDefault()
      const pos = this.getEventPos(e)
      const tool = this.getCurrentToolInstance()
      console.log(this.globalConfig);
      if (tool?.onStart) tool.onStart(this.ctx, pos, this.globalConfig)
    },

    handleMove(e) {
      e.preventDefault()
      const pos = this.getEventPos(e)
      const tool = this.getCurrentToolInstance()
      if (tool?.onMove) tool.onMove(this.ctx, pos, this.globalConfig)
    },

    handleEnd(e) {
      const pos = this.getEventPos(e)
      const tool = this.getCurrentToolInstance()
      if (tool?.onEnd) tool.onEnd(this.ctx, pos, this.globalConfig)
      this.saveState()
    },

    getEventPos(e) {
      const rect = this.canvas.getBoundingClientRect()
      const clientX = e.clientX ?? e.touches?.[0].clientX
      const clientY = e.clientY ?? e.touches?.[0].clientY
      
      // 屏幕坐标
      const screenX = clientX - rect.left
      const screenY = clientY - rect.top
      
      // 如果有视口系统，转换为世界坐标
      if (window.viewport) {
        return window.viewport.screenToWorld(screenX, screenY)
      }
      
      // 降级处理：直接使用屏幕坐标
      return {
        x: screenX * (this.canvas.width / rect.width),
        y: screenY * (this.canvas.height / rect.height),
      }
    },
  }
}
