import tools from '../../tools'

export default () => ({
  canvas: null,
  ctx: null,
  drawing: false,
  // 工具
  tools: [],
  toolInstances: {},
  currentTool: 'pen',
  // 历史记录
  history: [],
  historyStep: -1,
  canUndo: false,

  init() {
    this.initCanvas()
    this.initTools()
    this.selectTool('pen')
    // this.saveState()
  },
  initCanvas() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.resizeCanvas()

    window.addEventListener('resize', () => {
      this.resizeCanvas()
    })
  },
  initTools() {
    tools.forEach((ToolClass) => {
      const tool = new ToolClass()
      this.tools.push({
        id: tool.id,
        name: tool.name,
        icon: tool.icon,
      })
      this.toolInstances[tool.id] = tool
    })
  },
  resizeCanvas() {
    const container = this.canvas.parentElement
    this.canvas.width = container.clientWidth
    this.canvas.height = container.clientHeight
  },
  // 选择工具
  selectTool(toolId) {
    this.currentTool = toolId
    const tool = this.toolInstances[toolId]
    if (tool && tool.onActivate) {
      tool.onActivate(this.ctx, this.globalConfig)
    }
  },
  // 获取当前工具实例
  getCurrentTool() {
    return this.tools.find((t) => t.id === this.currentTool) || this.tools[0]
  },

  getCurrentToolInstance() {
    return this.toolInstances[this.currentTool]
  },
  handleStart(e) {
    e.preventDefault()
    const pos = this.getEventPos(e)
    const tool = this.getCurrentToolInstance()
    if (tool && tool.onStart) {
      tool.onStart(this.ctx, pos, this.globalConfig)
    }
  },
  handleMove(e) {
    e.preventDefault()
    const pos = this.getEventPos(e)
    const tool = this.getCurrentToolInstance()
    if (tool && tool.onMove) {
      tool.onMove(this.ctx, pos, this.globalConfig)
    }
  },
  handleEnd(e) {
    const pos = this.getEventPos(e)
    const tool = this.getCurrentToolInstance()
    if (tool && tool.onEnd) {
      tool.onEnd(this.ctx, pos, this.globalConfig)
    }

    // 保存状态用于撤销
    this.saveState()
  },

  getEventPos(e) {
    const rect = this.canvas.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height),
    }
  },

  // 计算属性
  get needsColor() {
    const tool = this.getCurrentToolInstance()
    return tool ? tool.needsColor() : true
  },

  get needsSize() {
    const tool = this.getCurrentToolInstance()
    return tool ? tool.needsSize() : true
  },

  get currentCursor() {
    const tool = this.getCurrentToolInstance()
    const cursor = tool ? tool.getCursor() : 'crosshair'
    return `cursor: ${cursor}`
  },

  get currentToolConfig() {
    const tool = this.getCurrentToolInstance()
    return tool ? tool.getToolConfig() : []
  },

  getToolStatus() {
    if (this.needsColor && this.needsSize) {
      return `颜色: ${this.globalConfig.color} | 大小: ${this.globalConfig.size}px`
    } else if (this.needsSize) {
      return `大小: ${this.globalConfig.size}px`
    }
    return ''
  },

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.history = []
    this.historyStep = -1
    this.canUndo = false
    this.saveState()
  },
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
})
