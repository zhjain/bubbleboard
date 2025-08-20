// import whiteboard from './whiteboard'
import canvasData from './canvas'
import historyData from './history'
import toolsData from './tools'

export default () => ({
  ...canvasData(),
  ...historyData(),
  ...toolsData(),


  init() {
    this.initCanvas()
    this.initTools()
    this.saveState()
  },
})
