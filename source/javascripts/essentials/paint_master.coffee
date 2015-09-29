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
    html = "
      <div class='pm-toolbox-wrapper pm-toolbox-#{@opts.position}'>
        <div class='pm-toolbox'></div>
        <div class='pm-current-tool'>
          <span> Current tool: </span>
          <span class='pm-current-tool-name'></span> 
        </div>
      </div>
    "
    if @opts.position == 'top'
      @toolboxEl = $(html).insertBefore(@wrapperEl).find('.pm-toolbox')
      @currentToolNameEl = $(@toolboxEl).parent().find('.pm-current-tool-name')
      @containerEl = $('.pm-toolbox-wrapper, .canvas-container').wrapAll('<div class="container"></div>')

  setToolboxEventListeners: ->
    self = @
    $(@containerEl).on 'click', '.pm-toolbox .pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onClick(e)
      if self.activeTool == self.toolbox[toolId]
        tool.deactivate() for key, tool of self.toolbox
        self.activeTool = null
      else
        self.toolbox[toolId].activate()
        self.activeTool = self.toolbox[toolId]

    $(@containerEl).on 'change', 'input', (e) ->
      toolId = $(this).parent().data('pmToolId')
      self.toolbox[toolId].onChange(e)

    $(@containerEl).on 'mouseover', '.pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onMouseover(e)

    $(@containerEl).on 'mouseleave', '.pm-tool', (e) ->
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
