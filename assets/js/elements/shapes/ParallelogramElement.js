import VectorElement from '../VectorElement.js'

// 平行四边形元素
class ParallelogramElement extends VectorElement {
  constructor(data) {
    super('parallelogram', data)
    this.skewAngle = data.style?.skewAngle || 15 // 默认倾斜15度
  }

  render() {
    const skew = this.skewAngle
    const offset = this.height * Math.tan(skew * Math.PI / 180)
    
    const points = [
      [this.x + offset, this.y],                    // 左上
      [this.x + this.width + offset, this.y],       // 右上
      [this.x + this.width, this.y + this.height],  // 右下
      [this.x, this.y + this.height]                // 左下
    ].map(p => p.join(',')).join(' ')

    return `
      <polygon id="${this.id}"
               points="${points}"
               fill="${this.style.fill}" 
               stroke="${this.style.stroke}"
               stroke-width="${this.style.strokeWidth}"
               class="vector-element ${this.selected ? 'selected' : ''}"
               data-element-id="${this.id}" />
    `
  }

  // 平行四边形的碰撞检测（简化为包围盒检测）
  containsPoint(x, y) {
    // 这里使用简化的包围盒检测，实际应该用更精确的多边形内点检测
    const skew = this.skewAngle
    const offset = this.height * Math.tan(skew * Math.PI / 180)
    const minX = Math.min(this.x, this.x + offset)
    const maxX = Math.max(this.x + this.width, this.x + this.width + offset)
    
    return x >= minX && x <= maxX && y >= this.y && y <= this.y + this.height
  }

  updateStyle(styleUpdates) {
    super.updateStyle(styleUpdates)
    if (styleUpdates.skewAngle !== undefined) {
      this.skewAngle = styleUpdates.skewAngle
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      skewAngle: this.skewAngle
    }
  }

  static fromJSON(data) {
    return new ParallelogramElement({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      style: {
        ...data.style,
        skewAngle: data.skewAngle
      }
    })
  }
}

export default ParallelogramElement