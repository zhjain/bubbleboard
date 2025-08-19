import tools from '../../tools'

export default function toolsData() {
  return {
    tools: [],
    toolInstances: {},
    currentTool: 'pen',

    initTools() {
      tools.forEach((ToolClass) => {
        const tool = new ToolClass()
        this.tools.push({
          id: tool.id,
          name: tool.name,
          icon: tool.icon,
        })
        this.toolInstances[tool.id] = tool
      })
      this.selectTool('pen')
    },

    selectTool(toolId) {
      this.currentTool = toolId
      const tool = this.toolInstances[toolId]
      if (tool?.onActivate) tool.onActivate(this.ctx, this.globalConfig)
    },

    getCurrentToolInstance() {
      return this.toolInstances[this.currentTool]
    },

    get currentToolConfig() {
      const tool = this.getCurrentToolInstance()
      return tool?.getToolConfig() ?? []
    },
  }
}
