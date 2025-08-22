// 选择管理器
class SelectionManager {
  constructor() {
    this.selectedElements = []
    this.selectionBox = null
    this.transformControls = null
  }

  init() {
    // 绑定到全局对象
    window.selectionManager = this
    
    // 创建选择框和变换控制
    this.createSelectionBox()
    this.createTransformControls()
    
    // 监听键盘事件
    this.bindKeyboardEvents()
  }

  // 选择单个元素
  select(element) {
    if (!element) return

    this.clearSelection()
    this.selectedElements = [element]
    element.selected = true
    
    this.updateSelection()
    console.log('Selected element:', element.id)
  }

  // 选择多个元素
  selectMultiple(elements) {
    if (!elements || elements.length === 0) return

    this.clearSelection()
    this.selectedElements = [...elements]
    
    for (const element of elements) {
      element.selected = true
    }
    
    this.updateSelection()
    console.log('Selected elements:', elements.map(el => el.id))
  }

  // 切换元素选择状态
  toggleSelection(element) {
    if (!element) return

    if (element.selected) {
      this.deselect(element)
    } else {
      this.addToSelection(element)
    }
  }

  // 添加到选择
  addToSelection(element) {
    if (!element || element.selected) return

    this.selectedElements.push(element)
    element.selected = true
    
    this.updateSelection()
    console.log('Added to selection:', element.id)
  }

  // 从选择中移除
  deselect(element) {
    if (!element || !element.selected) return

    const index = this.selectedElements.findIndex(el => el.id === element.id)
    if (index !== -1) {
      this.selectedElements.splice(index, 1)
      element.selected = false
    }
    
    this.updateSelection()
    console.log('Deselected element:', element.id)
  }

  // 清空选择
  clearSelection() {
    for (const element of this.selectedElements) {
      element.selected = false
    }
    
    this.selectedElements = []
    this.updateSelection()
  }

  // 更新选择状态的视觉反馈
  updateSelection() {
    // 重新渲染所有元素以更新选择状态
    if (window.elementManager) {
      window.elementManager.renderAll()
    }

    // 更新选择框和变换控制
    this.updateSelectionBox()
    this.updateTransformControls()
  }

  // 创建选择框
  createSelectionBox() {
    const vectorLayer = document.getElementById('vector-layer')
    if (!vectorLayer) return

    this.selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.selectionBox.id = 'selection-box'
    this.selectionBox.setAttribute('fill', 'none')
    this.selectionBox.setAttribute('stroke', '#3b82f6')
    this.selectionBox.setAttribute('stroke-width', '2')
    this.selectionBox.setAttribute('stroke-dasharray', '5,5')
    this.selectionBox.style.display = 'none'
    this.selectionBox.style.pointerEvents = 'none'
    
    vectorLayer.appendChild(this.selectionBox)
  }

  // 创建变换控制
  createTransformControls() {
    const vectorLayer = document.getElementById('vector-layer')
    if (!vectorLayer) return

    // 创建变换控制组
    this.transformControls = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.transformControls.id = 'transform-controls'
    this.transformControls.style.display = 'none'
    this.transformControls.style.pointerEvents = 'none'

    // 创建控制手柄
    const handles = [
      { id: 'nw', cursor: 'nw-resize' },
      { id: 'n', cursor: 'n-resize' },
      { id: 'ne', cursor: 'ne-resize' },
      { id: 'e', cursor: 'e-resize' },
      { id: 'se', cursor: 'se-resize' },
      { id: 's', cursor: 's-resize' },
      { id: 'sw', cursor: 'sw-resize' },
      { id: 'w', cursor: 'w-resize' }
    ]

    for (const handle of handles) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.id = `handle-${handle.id}`
      rect.setAttribute('width', '8')
      rect.setAttribute('height', '8')
      rect.setAttribute('fill', '#3b82f6')
      rect.setAttribute('stroke', 'white')
      rect.setAttribute('stroke-width', '1')
      rect.style.cursor = handle.cursor
      rect.style.pointerEvents = 'all'
      
      this.transformControls.appendChild(rect)
    }

    vectorLayer.appendChild(this.transformControls)
  }

  // 更新选择框
  updateSelectionBox() {
    if (!this.selectionBox) return

    if (this.selectedElements.length === 0) {
      this.selectionBox.style.display = 'none'
      return
    }

    const bounds = this.getSelectionBounds()
    if (bounds) {
      this.selectionBox.setAttribute('x', bounds.x - 2)
      this.selectionBox.setAttribute('y', bounds.y - 2)
      this.selectionBox.setAttribute('width', bounds.width + 4)
      this.selectionBox.setAttribute('height', bounds.height + 4)
      this.selectionBox.style.display = 'block'
    } else {
      this.selectionBox.style.display = 'none'
    }
  }

  // 更新变换控制
  updateTransformControls() {
    if (!this.transformControls) return

    if (this.selectedElements.length === 0) {
      this.transformControls.style.display = 'none'
      return
    }

    const bounds = this.getSelectionBounds()
    if (!bounds) {
      this.transformControls.style.display = 'none'
      return
    }

    // 更新控制手柄位置
    const handles = [
      { id: 'nw', x: bounds.x - 4, y: bounds.y - 4 },
      { id: 'n', x: bounds.x + bounds.width / 2 - 4, y: bounds.y - 4 },
      { id: 'ne', x: bounds.x + bounds.width - 4, y: bounds.y - 4 },
      { id: 'e', x: bounds.x + bounds.width - 4, y: bounds.y + bounds.height / 2 - 4 },
      { id: 'se', x: bounds.x + bounds.width - 4, y: bounds.y + bounds.height - 4 },
      { id: 's', x: bounds.x + bounds.width / 2 - 4, y: bounds.y + bounds.height - 4 },
      { id: 'sw', x: bounds.x - 4, y: bounds.y + bounds.height - 4 },
      { id: 'w', x: bounds.x - 4, y: bounds.y + bounds.height / 2 - 4 }
    ]

    for (const handle of handles) {
      const handleElement = document.getElementById(`handle-${handle.id}`)
      if (handleElement) {
        handleElement.setAttribute('x', handle.x)
        handleElement.setAttribute('y', handle.y)
      }
    }

    this.transformControls.style.display = 'block'
  }

  // 获取选择的边界框
  getSelectionBounds() {
    if (this.selectedElements.length === 0) return null

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    for (const element of this.selectedElements) {
      const bounds = element.getBounds()
      minX = Math.min(minX, bounds.x)
      minY = Math.min(minY, bounds.y)
      maxX = Math.max(maxX, bounds.x + bounds.width)
      maxY = Math.max(maxY, bounds.y + bounds.height)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  // 绑定键盘事件
  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // 删除选中元素
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedElements.length > 0) {
          e.preventDefault()
          if (window.elementManager) {
            window.elementManager.deleteSelectedElements()
          }
        }
      }

      // 复制选中元素
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (this.selectedElements.length > 0) {
          e.preventDefault()
          if (window.elementManager) {
            window.elementManager.duplicateSelectedElements()
          }
        }
      }

      // 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        if (window.elementManager) {
          this.selectMultiple(window.elementManager.elements)
        }
      }

      // 取消选择
      if (e.key === 'Escape') {
        this.clearSelection()
      }
    })

    // 点击空白区域取消选择
    document.addEventListener('click', (e) => {
      // 检查是否点击在画布上但不是元素
      const canvas = document.getElementById('whiteboard')
      if (e.target === canvas) {
        this.clearSelection()
      }
    })
  }

  // 获取选中元素的数量
  getSelectionCount() {
    return this.selectedElements.length
  }

  // 检查元素是否被选中
  isSelected(element) {
    return element && element.selected
  }
}

export default SelectionManager