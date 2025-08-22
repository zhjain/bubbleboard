// 矢量元素基类
class VectorElement {
  constructor(type, data) {
    this.id = this.generateId()
    this.type = type
    this.x = data.x || 0
    this.y = data.y || 0
    this.width = data.width || 100
    this.height = data.height || 100
    this.style = {
      fill: '#3b82f6',
      stroke: '#1e40af', 
      strokeWidth: 2,
      ...data.style
    }
    this.selected = false
    this.visible = true
    this.createdAt = Date.now()
  }

  generateId() {
    return 'element_' + Math.random().toString(36).substr(2, 9)
  }

  // 渲染为 SVG 元素
  render() {
    throw new Error('render() method must be implemented by subclass')
  }

  // 检查点是否在元素内
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height
  }

  // 获取边界框
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  // 移动元素
  move(deltaX, deltaY) {
    this.x += deltaX
    this.y += deltaY
  }

  // 调整大小
  resize(newWidth, newHeight) {
    this.width = Math.max(10, newWidth) // 最小宽度 10px
    this.height = Math.max(10, newHeight) // 最小高度 10px
  }

  // 更新样式
  updateStyle(styleUpdates) {
    this.style = { ...this.style, ...styleUpdates }
  }

  // 克隆元素
  clone() {
    const cloned = new this.constructor({
      x: this.x + 20, // 偏移一点避免重叠
      y: this.y + 20,
      width: this.width,
      height: this.height,
      style: { ...this.style }
    })
    return cloned
  }

  // 序列化为 JSON
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      style: this.style,
      createdAt: this.createdAt
    }
  }

  // 从 JSON 反序列化
  static fromJSON(data) {
    // 这个方法需要在具体的子类中实现
    throw new Error('fromJSON() method must be implemented by subclass')
  }
}

export default VectorElement