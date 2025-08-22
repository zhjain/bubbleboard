// 视口管理器 - 无限画布的核心
class ViewportManager {
  constructor() {
    this.x = 0          // 视口世界坐标 X
    this.y = 0          // 视口世界坐标 Y
    this.zoom = 1       // 缩放级别 (0.1 - 10)
    this.minZoom = 0.1  // 最小缩放
    this.maxZoom = 10   // 最大缩放
    this.width = 0      // 视口宽度
    this.height = 0     // 视口高度
    
    this.isDragging = false
    this.lastDragPos = null
    
    // 绑定到全局
    window.viewport = this
  }

  init() {
    this.updateViewportSize()
    this.bindEvents()
    this.applyTransform()
    
    console.log('Viewport initialized:', this.getInfo())
  }

  updateViewportSize() {
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      this.width = canvas.clientWidth
      this.height = canvas.clientHeight
    }
  }

  // 世界坐标转屏幕坐标
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom
    }
  }

  // 屏幕坐标转世界坐标
  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.zoom + this.x,
      y: screenY / this.zoom + this.y
    }
  }

  // 平移视口
  pan(deltaX, deltaY) {
    this.x -= deltaX / this.zoom
    this.y -= deltaY / this.zoom
    this.applyTransform()
  }

  // 缩放视口
  zoomAt(screenX, screenY, zoomDelta) {
    const oldZoom = this.zoom
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomDelta))
    
    if (newZoom === this.zoom) return

    // 计算缩放中心点的世界坐标
    const worldPoint = this.screenToWorld(screenX, screenY)
    
    // 更新缩放
    this.zoom = newZoom
    
    // 调整视口位置，使缩放中心点保持在屏幕上的相同位置
    const newScreenPoint = this.worldToScreen(worldPoint.x, worldPoint.y)
    this.x += (newScreenPoint.x - screenX) / this.zoom
    this.y += (newScreenPoint.y - screenY) / this.zoom
    
    this.applyTransform()
    console.log(`Zoomed to ${(this.zoom * 100).toFixed(0)}%`)
  }

  // 缩放到指定级别
  setZoom(newZoom, centerX = this.width / 2, centerY = this.height / 2) {
    const zoomRatio = newZoom / this.zoom
    this.zoomAt(centerX, centerY, zoomRatio)
  }

  // 重置视口
  reset() {
    this.x = 0
    this.y = 0
    this.zoom = 1
    this.applyTransform()
    console.log('Viewport reset')
  }

  // 适应所有内容
  fitContent() {
    if (!window.elementManager || window.elementManager.elements.length === 0) {
      this.reset()
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

    // 添加边距
    const padding = 100
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    // 计算内容尺寸
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    // 计算合适的缩放级别
    const scaleX = this.width / contentWidth
    const scaleY = this.height / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // 不超过 100%

    // 设置视口
    this.zoom = scale
    this.x = minX + contentWidth / 2 - this.width / (2 * scale)
    this.y = minY + contentHeight / 2 - this.height / (2 * scale)

    this.applyTransform()
    console.log('Fitted content to viewport')
  }

  // 应用变换到 DOM 元素
  applyTransform() {
    const transform = `translate(${-this.x * this.zoom}px, ${-this.y * this.zoom}px) scale(${this.zoom})`
    
    // 应用到 Canvas
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      canvas.style.transform = transform
      canvas.style.transformOrigin = '0 0'
    }

    // 应用到 SVG 图层
    const vectorLayer = document.getElementById('vector-layer')
    if (vectorLayer) {
      vectorLayer.style.transform = transform
      vectorLayer.style.transformOrigin = '0 0'
    }

    // 更新网格（如果有）
    this.updateGrid()
  }

  // 更新网格显示
  updateGrid() {
    // 这里可以添加网格渲染逻辑
    // 根据缩放级别调整网格密度
  }

  // 绑定事件
  bindEvents() {
    const canvas = document.getElementById('whiteboard')
    if (!canvas) return

    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      
      const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
      this.zoomAt(screenX, screenY, zoomDelta)
    })

    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.updateViewportSize()
      this.applyTransform()
    })

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '0':
            e.preventDefault()
            this.reset()
            break
          case '1':
            e.preventDefault()
            this.setZoom(1)
            break
          case '=':
          case '+':
            e.preventDefault()
            this.setZoom(this.zoom * 1.2)
            break
          case '-':
            e.preventDefault()
            this.setZoom(this.zoom * 0.8)
            break
        }
      }
    })
  }

  // 获取视口信息
  getInfo() {
    return {
      position: { x: this.x, y: this.y },
      zoom: this.zoom,
      zoomPercent: Math.round(this.zoom * 100) + '%',
      size: { width: this.width, height: this.height }
    }
  }

  // 获取可见区域的世界坐标边界
  getVisibleBounds() {
    const topLeft = this.screenToWorld(0, 0)
    const bottomRight = this.screenToWorld(this.width, this.height)
    
    return {
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }
  }
}

export default ViewportManager