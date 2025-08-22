import VectorElement from '../VectorElement.js'

// 椭圆元素
class EllipseElement extends VectorElement {
  constructor(data) {
    super('ellipse', data)
  }

  render() {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const rx = this.width / 2
    const ry = this.height / 2

    return `
      <ellipse id="${this.id}"
               cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
               fill="${this.style.fill}" 
               stroke="${this.style.stroke}"
               stroke-width="${this.style.strokeWidth}"
               class="vector-element ${this.selected ? 'selected' : ''}"
               data-element-id="${this.id}" />
    `
  }

  // 椭圆的碰撞检测
  containsPoint(x, y) {
    const cx = this.x + this.width / 2
    const cy = this.y + this.height / 2
    const rx = this.width / 2
    const ry = this.height / 2
    
    // 椭圆方程: (x-cx)²/rx² + (y-cy)²/ry² <= 1
    const normalizedX = (x - cx) / rx
    const normalizedY = (y - cy) / ry
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1
  }

  static fromJSON(data) {
    return new EllipseElement({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      style: data.style
    })
  }
}

export default EllipseElement