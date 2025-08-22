import BaseTool from './base.js'

// 选择工具（元素选择）
class SelectTool extends BaseTool {
  constructor() {
    super('select', '选择', '↖️')
    this.isDragging = false
    this.dragStartPos = null
    this.selectedElements = []
    this.dragMode = null // 'select', 'move', 'resize'
    this.isBoxSelecting = false
    this.selectionBox = null
  }

  onActivate(ctx, globalConfig) {
    // 激活时改变画布光标
    const canvas = document.getElementById('whiteboard')
    if (canvas) {
      canvas.style.cursor = 'default'
    }
  }

  onStart(ctx, pos, globalConfig) {
    this.isDragging = true
    this.dragStartPos = { ...pos }

    // 检查是否点击在元素上
    const clickedElement = this.getElementAtPosition(pos.x, pos.y)
    
    if (clickedElement) {
      // 点击在元素上
      if (window.selectionManager) {
        if (globalConfig.ctrlKey || globalConfig.metaKey) {
          // Ctrl/Cmd + 点击 = 多选
          window.selectionManager.toggleSelection(clickedElement)
        } else if (!clickedElement.selected) {
          // 普通点击未选中元素 = 单选
          window.selectionManager.select(clickedElement)
        }
        // 如果点击已选中元素，准备拖拽
        this.dragMode = 'move'
      }
    } else {
      // 点击在空白区域，开始框选
      if (window.selectionManager && !(globalConfig.ctrlKey || globalConfig.metaKey)) {
        window.selectionManager.clearSelection()
      }
      this.startBoxSelection(pos)
    }
  }

  onMove(ctx, pos, globalConfig) {
    if (!this.isDragging || !this.dragStartPos) return

    const deltaX = pos.x - this.dragStartPos.x
    const deltaY = pos.y - this.dragStartPos.y

    if (this.dragMode === 'move') {
      // 拖拽移动选中的元素
      this.moveSelectedElements(deltaX, deltaY)
      this.dragStartPos = { ...pos } // 更新起始位置
    } else if (this.isBoxSelecting) {
      // 更新框选区域
      this.updateBoxSelection(this.dragStartPos, pos)
    }
  }

  onEnd(ctx, pos, globalConfig) {
    if (this.isBoxSelecting) {
      // 完成框选
      this.finishBoxSelection(this.dragStartPos, pos)
    }

    this.isDragging = false
    this.dragStartPos = null
    this.dragMode = null
    this.isBoxSelecting = false
  }

  getElementAtPosition(x, y) {
    if (window.elementManager) {
      return window.elementManager.getElementAtPosition(x, y)
    }
    return null
  }

  moveSelectedElements(deltaX, deltaY) {
    if (window.elementManager) {
      window.elementManager.moveSelectedElements(deltaX, deltaY)
    }
  }

  startBoxSelection(startPos) {
    this.isBoxSelecting = true
    this.createSelectionBox(startPos, startPos)
  }

  updateBoxSelection(startPos, currentPos) {
    if (!this.selectionBox) return

    const x = Math.min(startPos.x, currentPos.x)
    const y = Math.min(startPos.y, currentPos.y)
    const width = Math.abs(currentPos.x - startPos.x)
    const height = Math.abs(currentPos.y - startPos.y)

    this.selectionBox.setAttribute('x', x)
    this.selectionBox.setAttribute('y', y)
    this.selectionBox.setAttribute('width', width)
    this.selectionBox.setAttribute('height', height)
  }

  finishBoxSelection(startPos, endPos) {
    // 移除选择框
    this.removeSelectionBox()

    // 计算选择区域
    const x1 = Math.min(startPos.x, endPos.x)
    const y1 = Math.min(startPos.y, endPos.y)
    const x2 = Math.max(startPos.x, endPos.x)
    const y2 = Math.max(startPos.y, endPos.y)

    // 查找在选择区域内的元素
    const elementsInBox = []
    if (window.elementManager) {
      for (const element of window.elementManager.elements) {
        if (this.isElementInBox(element, x1, y1, x2, y2)) {
          elementsInBox.push(element)
        }
      }
    }

    // 选中这些元素
    if (window.selectionManager && elementsInBox.length > 0) {
      window.selectionManager.selectMultiple(elementsInBox)
    }
  }

  isElementInBox(element, x1, y1, x2, y2) {
    const bounds = element.getBounds()
    return bounds.x >= x1 && bounds.y >= y1 && 
           bounds.x + bounds.width <= x2 && bounds.y + bounds.height <= y2
  }

  createSelectionBox(startPos, endPos) {
    const vectorLayer = document.getElementById('vector-layer')
    if (!vectorLayer) return

    this.selectionBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.selectionBox.id = 'box-selection'
    this.selectionBox.setAttribute('fill', 'rgba(59, 130, 246, 0.1)')
    this.selectionBox.setAttribute('stroke', '#3b82f6')
    this.selectionBox.setAttribute('stroke-width', '1')
    this.selectionBox.setAttribute('stroke-dasharray', '3,3')
    this.selectionBox.style.pointerEvents = 'none'
    
    vectorLayer.appendChild(this.selectionBox)
  }

  removeSelectionBox() {
    if (this.selectionBox) {
      this.selectionBox.remove()
      this.selectionBox = null
    }
  }

  getCursor() {
    return 'default'
  }

  getToolConfig() {
    const selectedCount = window.selectionManager ? window.selectionManager.getSelectionCount() : 0
    
    if (selectedCount === 0) {
      return []
    }

    return [
      { key: 'info', label: `已选择 ${selectedCount} 个元素`, type: 'info' },
      { key: 'duplicate', label: '复制', type: 'button', action: 'duplicate' },
      { key: 'delete', label: '删除', type: 'button', action: 'delete' },
      { key: 'bringToFront', label: '置顶', type: 'button', action: 'bringToFront' },
      { key: 'sendToBack', label: '置底', type: 'button', action: 'sendToBack' }
    ]
  }
}

export default SelectTool