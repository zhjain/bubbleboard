export default function canvasData() {
  return {
    canvas: null,
    ctx: null,

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
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height),
      }
    },
  }
}
