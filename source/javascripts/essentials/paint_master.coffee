window.PaintMasterPlugin = {}
window.PaintMasterPlugin.tools = {}
window.PaintMasterPlugin.PaintMaster = class PaintMaster
  constructor: (@opts) ->
    @toolbox = {}

    @fCanvas = new fabric.Canvas(@opts.id)

    @wrapperEl = $(@fCanvas.wrapperEl)

    @drawToolbox()
    @setToolboxEventListeners()
    @setDrawListeners()

    @fCanvas.setWidth @opts.width
    @fCanvas.setHeight @opts.height
    @fCanvas.setBackgroundColor 'white'
    @fCanvas.renderAll()

  drawToolbox: ->
    console.log 'drawToolbox'
    console.log @wrapperEl
    html = "<div class='pm-toolbox pm-toolbox-#{@opts.position}'></div>"
    @toolboxEl = $(html).appendTo @wrapperEl

  setToolboxEventListeners: ->
    self = @
    $(@wrapperEl).on 'click', '.pm-toolbox .pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onClick(e)
      if self.activeTool == self.toolbox[toolId]
        tool.deactivate() for key, tool of self.toolbox
        self.activeTool = null
      else
        self.toolbox[toolId].activate()
        self.activeTool = self.toolbox[toolId]

    $(@wrapperEl).on 'change', 'input', (e) ->
      toolId = $(this).parent().data('pmToolId')
      self.toolbox[toolId].onChange(e)

    $(@wrapperEl).on 'mouseover', '.pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onMouseover(e)

    $(@wrapperEl).on 'mouseleave', '.pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onMouseleave(e)

    onKeyDownHandler = (e) ->
      switch e.keyCode
        when 46, 8
          if self.fCanvas.getActiveObject()
            e.preventDefault()
            if self.activeTool
              self.activeTool.onBackspace(e)
            else
              activeObject = self.fCanvas.getActiveObject()
              self.fCanvas.remove activeObject
        when 13
          if self.fCanvas.getActiveObject() and self.activeTool
            e.preventDefault()
            self.activeTool.onSubmit(e)
              
    window.onkeydown = onKeyDownHandler

  setDrawListeners: ->
    @fCanvas.observe 'mouse:down', (e) =>
      @activeTool.mousedown(e) if @activeTool and @activeTool.active
    @fCanvas.observe 'mouse:move', (e) =>
      @activeTool.mousemove(e) if @activeTool and @activeTool.active
    @fCanvas.observe 'mouse:up', (e) =>
      @activeTool.mouseup(e) if @activeTool and @activeTool.active


  addToolboxItem: (item) ->
    item = new item(@)
    @toolboxEl.append(item.html)
    @toolbox[item.id] = item

  removeToolboxItem: (itemId) ->
    @toolbox[itemId].onRemove()
    delete @toolbox[itemId]

  exportImage: (format) ->
    img = @fCanvas.toDataURL({
      format: format,
      left: 0,
      top: 0,
      width: @fCanvas.width,
      height: @fCanvas.height
    })
    return img
