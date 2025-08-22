import VectorElement from '../VectorElement.js'

// 圆形元素
class CircleElement extends VectorElement {
  constructor(data) {
    super('circle', data)
  }

  render() {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const r = Math.min(this.width, this.height) / 2

    return `
      <circle id="${this.id}"
              cx="${cx}" cy="${cy}" r="${r}"
              fill="${this.style.fill}" 
              stroke="${this.style.stroke}"
              stroke-width="${this.style.strokeWidth}"
              class="vector-element ${this.selected ? 'selected' : ''}"
              data-element-id="${this.id}" />
    `
  }

  // 圆形的碰撞检测需要特殊处理
  containsPoint(x, y) {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const r = Math.min(this.width, this.height) / 2
    const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    return distance <= r
  }

  static fromJSON(data) {
    return new CircleElement({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      style: data.style
    })
  }
}

export default CircleElement