import VectorElement from '../VectorElement.js'

// 矩形元素
class RectangleElement extends VectorElement {
  constructor(data) {
    super('rectangle', data)
    this.cornerRadius = data.style?.cornerRadius || 0
  }

  render() {
    return `
      <rect id="${this.id}" 
            x="${this.x}" y="${this.y}" 
            width="${this.width}" height="${this.height}"
            rx="${this.cornerRadius}"
            fill="${this.style.fill}" 
            stroke="${this.style.stroke}"
            stroke-width="${this.style.strokeWidth}"
            class="vector-element ${this.selected ? 'selected' : ''}"
            data-element-id="${this.id}" />
    `
  }

  updateStyle(styleUpdates) {
    super.updateStyle(styleUpdates)
    if (styleUpdates.cornerRadius !== undefined) {
      this.cornerRadius = styleUpdates.cornerRadius
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cornerRadius: this.cornerRadius
    }
  }

  static fromJSON(data) {
    return new RectangleElement({
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      style: {
        ...data.style,
        cornerRadius: data.cornerRadius
      }
    })
  }
}

export default RectangleElement