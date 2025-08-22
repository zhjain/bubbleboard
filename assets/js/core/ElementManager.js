// 矢量元素管理器
class ElementManager {
  constructor() {
    this.elements = []
    this.nextZIndex = 1
    this.vectorLayer = null
  }

  init() {
    // 创建 SVG 矢量图层
    this.createVectorLayer()
    
    // 绑定到全局对象，方便其他模块访问
    window.elementManager = this
  }

  createVectorLayer() {
    const canvas = document.getElementById('whiteboard')
    if (!canvas) return

    const canvasContainer = canvas.parentElement
    
    // 创建 SVG 图层，覆盖在 Canvas 上方
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'vector-layer'
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.pointerEvents = 'none' // 让鼠标事件穿透到 canvas
    svg.style.zIndex = '10'

    // 添加箭头标记定义（用于连接线）
    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
    `

    canvasContainer.appendChild(svg)
    this.vectorLayer = svg

    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resizeVectorLayer())
    this.resizeVectorLayer()
  }

  resizeVectorLayer() {
    if (!this.vectorLayer) return
    
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      this.vectorLayer.setAttribute('width', canvas.width)
      this.vectorLayer.setAttribute('height', canvas.height)
    }
  }

  // 添加元素
  add(element) {
    if (!element) return

    element.zIndex = this.nextZIndex++
    this.elements.push(element)
    this.renderElement(element)
    
    console.log(`Added ${element.type} element:`, element)
    return element
  }

  // 删除元素
  remove(element) {
    const index = this.elements.findIndex(el => el.id === element.id)
    if (index !== -1) {
      this.elements.splice(index, 1)
      this.removeElementFromDOM(element)
      console.log(`Removed ${element.type} element:`, element.id)
    }
  }

  // 根据 ID 查找元素
  getElementById(id) {
    return this.elements.find(el => el.id === id)
  }

  // 根据位置查找元素（从上到下）
  getElementAtPosition(x, y) {
    // 从最上层开始查找
    const sortedElements = [...this.elements].sort((a, b) => b.zIndex - a.zIndex)
    
    for (const element of sortedElements) {
      if (element.visible && element.containsPoint(x, y)) {
        return element
      }
    }
    return null
  }

  // 获取所有选中的元素
  getSelectedElements() {
    return this.elements.filter(el => el.selected)
  }

  // 清空所有元素
  clear() {
    this.elements = []
    this.nextZIndex = 1
    if (this.vectorLayer) {
      // 保留 defs，清除其他内容
      const defs = this.vectorLayer.querySelector('defs')
      this.vectorLayer.innerHTML = ''
      if (defs) {
        this.vectorLayer.appendChild(defs)
      }
    }
    console.log('Cleared all elements')
  }

  // 渲染单个元素
  renderElement(element) {
    if (!this.vectorLayer || !element) return

    // 移除旧的元素（如果存在）
    this.removeElementFromDOM(element)

    // 渲染新元素
    const elementHtml = element.render()
    this.vectorLayer.insertAdjacentHTML('beforeend', elementHtml)

    // 添加事件监听
    this.addElementEventListeners(element)
  }

  // 从 DOM 中移除元素
  removeElementFromDOM(element) {
    if (!element) return
    
    const domElement = document.getElementById(element.id)
    if (domElement) {
      domElement.remove()
    }
  }

  // 重新渲染所有元素
  renderAll() {
    if (!this.vectorLayer) return

    // 清除现有内容（保留 defs）
    const defs = this.vectorLayer.querySelector('defs')
    this.vectorLayer.innerHTML = ''
    if (defs) {
      this.vectorLayer.appendChild(defs)
    }

    // 按 z-index 排序渲染
    const sortedElements = [...this.elements].sort((a, b) => a.zIndex - b.zIndex)
    
    for (const element of sortedElements) {
      if (element.visible) {
        const elementHtml = element.render()
        this.vectorLayer.insertAdjacentHTML('beforeend', elementHtml)
        this.addElementEventListeners(element)
      }
    }
  }

  // 添加元素事件监听
  addElementEventListeners(element) {
    const domElement = document.getElementById(element.id)
    if (!domElement) return

    // 启用指针事件
    domElement.style.pointerEvents = 'all'

    // 点击选择
    domElement.addEventListener('click', (e) => {
      e.stopPropagation()
      if (window.selectionManager) {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + 点击 = 多选
          window.selectionManager.toggleSelection(element)
        } else {
          // 普通点击 = 单选
          window.selectionManager.select(element)
        }
      }
    })

    // 悬停效果
    domElement.addEventListener('mouseenter', () => {
      if (!element.selected) {
        domElement.style.opacity = '0.8'
      }
    })

    domElement.addEventListener('mouseleave', () => {
      if (!element.selected) {
        domElement.style.opacity = '1'
      }
    })
  }

  // 移动选中的元素
  moveSelectedElements(deltaX, deltaY) {
    const selectedElements = this.getSelectedElements()
    
    for (const element of selectedElements) {
      element.move(deltaX, deltaY)
    }
    
    if (selectedElements.length > 0) {
      this.renderAll()
    }
  }

  // 删除选中的元素
  deleteSelectedElements() {
    const selectedElements = this.getSelectedElements()
    
    for (const element of selectedElements) {
      this.remove(element)
    }

    if (window.selectionManager) {
      window.selectionManager.clearSelection()
    }
  }

  // 复制选中的元素
  duplicateSelectedElements() {
    const selectedElements = this.getSelectedElements()
    const newElements = []

    for (const element of selectedElements) {
      const cloned = element.clone()
      this.add(cloned)
      newElements.push(cloned)
    }

    // 选中新复制的元素
    if (window.selectionManager && newElements.length > 0) {
      window.selectionManager.selectMultiple(newElements)
    }

    return newElements
  }

  // 导出为 JSON
  toJSON() {
    return {
      elements: this.elements.map(el => el.toJSON()),
      nextZIndex: this.nextZIndex
    }
  }

  // 从 JSON 导入
  fromJSON(data) {
    this.clear()
    this.nextZIndex = data.nextZIndex || 1

    // 这里需要根据元素类型创建对应的实例
    // 暂时先记录，后续实现具体的反序列化逻辑
    console.log('Import from JSON:', data)
  }
}

export default ElementManager