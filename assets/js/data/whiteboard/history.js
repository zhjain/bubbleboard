export default function historyData() {
  return {
    history: [],
    historyStep: -1,
    canUndo: false,

    saveState() {
      this.historyStep++
      if (this.historyStep < this.history.length) {
        this.history.length = this.historyStep
      }
      this.history.push(this.canvas.toDataURL())
      this.canUndo = this.historyStep > 0
    },

    undo() {
      if (this.historyStep > 0) {
        this.historyStep--
        this.restoreState()
        this.canUndo = this.historyStep > 0
      }
    },

    restoreState() {
      const img = new Image()
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.drawImage(img, 0, 0)
      }
      img.src = this.history[this.historyStep]
    },

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.history = []
      this.historyStep = -1
      this.canUndo = false
      this.saveState()
    },
  }
}
