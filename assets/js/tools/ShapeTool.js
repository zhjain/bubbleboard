import BaseTool from './base.js'
import RectangleElement from '../elements/shapes/RectangleElement.js'
import DiamondElement from '../elements/shapes/DiamondElement.js'
import CircleElement from '../elements/shapes/CircleElement.js'
import EllipseElement from '../elements/shapes/EllipseElement.js'
import ParallelogramElement from '../elements/shapes/ParallelogramElement.js'

// 统一形状工具
class ShapeTool extends BaseTool {
  constructor() {
    super('shape', '形状', '⬜')
    this.currentShape = 'rectangle'  // 默认矩形
    this.isDrawing = false
    this.startPos = null
    this.previewElement = null
  }

  // 切换形状类型
  setShapeType(shapeType) {
    this.currentShape = shapeType
    this.updateIcon()
    // 触发配置更新事件
    if (this.onShapeTypeChange) {
      this.onShapeTypeChange(shapeType)
    }
  }

  updateIcon() {
    const icons = {
      rectangle: '⬜',
      diamond: '◇', 
      parallelogram: '▱',
      circle: '⭕',
      ellipse: '⭕'
    }
    this.icon = icons[this.currentShape] || '⬜'
  }

  onActivate(ctx, globalConfig) {
    // 形状工具激活时的设置
    this.updateIcon()
  }

  onStart(ctx, pos, globalConfig) {
    this.isDrawing = true
    this.startPos = { ...pos }
    
    // 创建预览元素
    this.createPreviewElement(pos, pos, globalConfig)
  }

  onMove(ctx, pos, globalConfig) {
    if (!this.isDrawing || !this.startPos) return
    
    // 更新预览元素
    this.updatePreviewElement(this.startPos, pos, globalConfig)
  }

  onEnd(ctx, pos, globalConfig) {
    if (!this.isDrawing || !this.startPos) return
    
    this.isDrawing = false
    
    // 移除预览元素
    this.removePreviewElement()
    
    // 创建最终的矢量元素
    const element = this.createShapeElement(this.startPos, pos, globalConfig)
    
    if (element && (Math.abs(element.width) > 5 && Math.abs(element.height) > 5)) {
      // 只有当形状足够大时才创建
      if (window.elementManager) {
        window.elementManager.add(element)
        if (window.selectionManager) {
          window.selectionManager.select(element)
        }
      }
    }
    
    this.startPos = null
  }

  createPreviewElement(startPos, endPos, config) {
    const shapeData = this.calculateShapeData(startPos, endPos, config)
    this.previewElement = this.createElementByType(this.currentShape, shapeData)
    
    // 添加预览样式
    if (this.previewElement) {
      this.previewElement.style.opacity = 0.7
      this.renderPreview()
    }
  }

  updatePreviewElement(startPos, endPos, config) {
    if (!this.previewElement) return
    
    const shapeData = this.calculateShapeData(startPos, endPos, config)
    
    // 更新预览元素的属性
    this.previewElement.x = shapeData.x
    this.previewElement.y = shapeData.y
    this.previewElement.width = shapeData.width
    this.previewElement.height = shapeData.height
    this.previewElement.updateStyle(shapeData.style)
    
    this.renderPreview()
  }

  removePreviewElement() {
    if (this.previewElement) {
      const previewSvg = document.getElementById('preview-element')
      if (previewSvg) {
        previewSvg.remove()
      }
      this.previewElement = null
    }
  }

  renderPreview() {
    if (!this.previewElement) return
    
    // 移除旧的预览
    const oldPreview = document.getElementById('preview-element')
    if (oldPreview) {
      oldPreview.remove()
    }
    
    // 创建新的预览
    const vectorLayer = document.getElementById('vector-layer')
    if (vectorLayer) {
      const previewHtml = this.previewElement.render().replace(
        `id="${this.previewElement.id}"`,
        `id="preview-element"`
      )
      vectorLayer.insertAdjacentHTML('beforeend', previewHtml)
    }
  }

  calculateShapeData(startPos, endPos, config) {
    return {
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y),
      width: Math.abs(endPos.x - startPos.x),
      height: Math.abs(endPos.y - startPos.y),
      style: {
        fill: config.fill || '#3b82f6',
        stroke: config.stroke || '#1e40af',
        strokeWidth: config.strokeWidth || 2,
        cornerRadius: config.cornerRadius || 0,
        rotation: config.rotation || 0,
        skewAngle: config.skewAngle || 15
      }
    }
  }

  createShapeElement(startPos, endPos, config) {
    const shapeData = this.calculateShapeData(startPos, endPos, config)
    return this.createElementByType(this.currentShape, shapeData)
  }

  createElementByType(shapeType, shapeData) {
    switch(shapeType) {
      case 'rectangle':
        return new RectangleElement(shapeData)
      case 'diamond':
        return new DiamondElement(shapeData)
      case 'parallelogram':
        return new ParallelogramElement(shapeData)
      case 'circle':
        return new CircleElement(shapeData)
      case 'ellipse':
        return new EllipseElement(shapeData)
      default:
        return new RectangleElement(shapeData)
    }
  }

  getToolConfig() {
    const baseConfig = [
      { key: 'fill', label: '填充', type: 'color', value: '#3b82f6' },
      { key: 'stroke', label: '边框', type: 'color', value: '#1e40af' },
      { key: 'strokeWidth', label: '粗细', type: 'range', min: 0, max: 20, value: 2 }
    ]

    // 根据形状类型添加特定配置
    const shapeSpecificConfig = {
      rectangle: [
        { key: 'cornerRadius', label: '圆角', type: 'range', min: 0, max: 50, value: 0 }
      ],
      diamond: [
        { key: 'rotation', label: '旋转', type: 'range', min: 0, max: 360, value: 0 }
      ],
      parallelogram: [
        { key: 'skewAngle', label: '倾斜', type: 'range', min: -45, max: 45, value: 15 }
      ],
      circle: [],
      ellipse: []
    }

    return [...baseConfig, ...(shapeSpecificConfig[this.currentShape] || [])]
  }

  getCursor() {
    return 'crosshair'
  }
}

export default ShapeTool