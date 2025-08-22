// import whiteboard from './whiteboard'
import canvasData from './canvas'
import historyData from './history'
import toolsData from './tools'
import ElementManager from '../../core/ElementManager.js'
import SelectionManager from '../../core/SelectionManager.js'
import ViewportManager from '../../core/ViewportManager.js'

export default () => ({
  ...canvasData(),
  ...historyData(),
  ...toolsData(),

  // 新增：二级工具栏状态
  showSecondaryToolbar: true,
  
  // 新增：形状工具状态
  currentShapeType: 'rectangle',

  init() {
    this.initCanvas()
    this.initTools()
    this.initVectorSystem()
    this.saveState()
    // 默认显示二级工具栏
    this.showSecondaryToolbar = true
  },

  // 初始化矢量系统
  initVectorSystem() {
    // 初始化视口管理器（无限画布）
    const viewportManager = new ViewportManager()
    viewportManager.init()
    
    // 初始化元素管理器
    const elementManager = new ElementManager()
    elementManager.init()
    
    // 初始化选择管理器
    const selectionManager = new SelectionManager()
    selectionManager.init()
    
    console.log('Vector system with infinite canvas initialized')
  },

  // 获取当前工具名称
  getCurrentToolName() {
    const tool = this.getCurrentToolInstance()
    return tool ? tool.name : '未选择'
  },

  // 获取当前工具鼠标样式
  getCurrentToolCursor() {
    const tool = this.getCurrentToolInstance()
    return tool ? tool.getCursor() : 'default'
  },

  // 切换二级工具栏显示
  toggleSecondaryToolbar() {
    this.showSecondaryToolbar = !this.showSecondaryToolbar
  },

  // 设置形状类型
  setShapeType(shapeType) {
    this.currentShapeType = shapeType
    
    // 如果当前是形状工具，更新工具状态
    const shapeTool = this.getCurrentToolInstance()
    if (shapeTool && shapeTool.id === 'shape') {
      shapeTool.setShapeType(shapeType)
    }
    
    console.log('Shape type changed to:', shapeType)
  },

  // 获取形状工具图标
  getShapeIcon() {
    const icons = {
      rectangle: '⬜',
      diamond: '◇', 
      parallelogram: '▱',
      circle: '⭕',
      ellipse: '⭕'
    }
    return icons[this.currentShapeType] || '⬜'
  },

  // 获取当前形状工具配置
  getCurrentShapeConfig() {
    const shapeTool = this.getCurrentToolInstance()
    if (shapeTool && shapeTool.id === 'shape') {
      return shapeTool.getToolConfig()
    }
    return []
  },

  // 选择工具操作方法
  duplicateSelected() {
    if (window.elementManager) {
      window.elementManager.duplicateSelectedElements()
    }
  },

  deleteSelected() {
    if (window.elementManager) {
      window.elementManager.deleteSelectedElements()
    }
  },

  selectAll() {
    if (window.elementManager && window.selectionManager) {
      window.selectionManager.selectMultiple(window.elementManager.elements)
    }
  },

  // 平移工具操作方法（使用视口系统）
  resetView() {
    if (window.viewport) {
      window.viewport.reset()
    } else {
      // 降级处理
      const canvas = document.getElementById('whiteboard')
      const vectorLayer = document.getElementById('vector-layer')
      
      if (canvas) {
        canvas.style.transform = 'translate(0px, 0px) scale(1)'
      }
      if (vectorLayer) {
        vectorLayer.style.transform = 'translate(0px, 0px) scale(1)'
      }
    }
    
    console.log('View reset to origin')
  },

  fitToScreen() {
    if (window.viewport) {
      window.viewport.fitContent()
    } else {
      // 降级处理 - 适应屏幕
      if (!window.elementManager || window.elementManager.elements.length === 0) {
        this.resetView()
        return
      }

      // 计算所有元素的边界框
      let minX = Infinity, minY = Infinity
      let maxX = -Infinity, maxY = -Infinity

      for (const element of window.elementManager.elements) {
        const bounds = element.getBounds()
        minX = Math.min(minX, bounds.x)
        minY = Math.min(minY, bounds.y)
        maxX = Math.max(maxX, bounds.x + bounds.width)
        maxY = Math.max(maxY, bounds.y + bounds.height)
      }

      // 计算内容的中心点
      const contentCenterX = (minX + maxX) / 2
      const contentCenterY = (minY + maxY) / 2

      // 计算画布的中心点
      const canvas = document.getElementById('whiteboard')
      if (!canvas) return

      const canvasCenterX = canvas.width / 2
      const canvasCenterY = canvas.height / 2

      // 计算需要的偏移量
      const offsetX = canvasCenterX - contentCenterX
      const offsetY = canvasCenterY - contentCenterY

      // 应用变换
      const vectorLayer = document.getElementById('vector-layer')
      if (canvas) {
        canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }
      if (vectorLayer) {
        vectorLayer.style.transform = `translate(${offsetX}px, ${offsetY}px)`
      }
    }

    console.log('Fitted content to screen')
  },

  // 新增：缩放操作方法
  zoomIn() {
    if (window.viewport) {
      window.viewport.setZoom(window.viewport.zoom * 1.2)
    }
  },

  zoomOut() {
    if (window.viewport) {
      window.viewport.setZoom(window.viewport.zoom * 0.8)
    }
  },

  setZoom(zoomLevel) {
    if (window.viewport) {
      window.viewport.setZoom(zoomLevel)
    }
  },

  // 获取当前视口信息
  getViewportInfo() {
    if (window.viewport) {
      return window.viewport.getInfo()
    }
    return { zoom: 1, position: { x: 0, y: 0 } }
  },
})
