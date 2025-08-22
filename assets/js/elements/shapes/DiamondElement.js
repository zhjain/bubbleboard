import VectorElement from '../VectorElement.js'

// 菱形元素
class DiamondElement extends VectorElement {
  constructor(data) {
    super('diamond', data)
    this.rotation = data.style?.rotation || 0
  }

  render() {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const points = [
      [cx, this.y],                    // 上
      [this.x + this.width, cy],       // 右
      [cx, this.y + this.height],      // 下
      [this.x, cy]                     // 左
    ].map(p => p.join(',')).join(' ')

    return `
      <polygon id="${this.id}"
               points="${points}"
               fill="${this.style.fill}" 
               stroke="${this.style.stroke}"
               stroke-width="${this.style.strokeWidth}"
               transform="rotate(${this.rotation} ${cx} ${cy})"
               class="vector-element ${this.selected ? 'selected' : ''}"
               data-element-id="${this.id}" />
    `
  }

  updateStyle(styleUpdates) {
    super.updateStyle(styleUpdates)
    if (styleUpdates.rotation !== undefined) {
      this.rotation = styleUpdates.rotation
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      rotation: this.rotation
    }
  }

  static fromJSON(data) {
    return new DiamondElement({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      style: {
        ...data.style,
        rotation: data.rotation
      }
    })
  }
}

export default DiamondElement