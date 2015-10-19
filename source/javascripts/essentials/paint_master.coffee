window.PaintMasterPlugin = {}
window.PaintMasterPlugin.tools = {}
window.PaintMasterPlugin.PaintMaster = class PaintMaster
  constructor: (@opts) ->
    @toolbox = {}
    @settings =
      canvasWidth: @opts.width
      canvasHeight: @opts.height
      fontSize: 16
      brushSize: 5

    @fCanvas = new fabric.Canvas(@opts.id)

    @wrapperEl = $(@fCanvas.wrapperEl)

    @drawToolbox()
    @setToolboxEventListeners()
    @setDrawListeners()
    @setAttributeListeners()

    @fCanvas.setWidth @opts.width
    @fCanvas.setHeight @opts.height
    @fCanvas.setBackgroundColor 'white'
    @fCanvas.renderAll()

  drawToolbox: ->
    html = "
      <div class='pm-toolbox-wrapper pm-toolbox-#{@opts.position}'>
        <div class='pm-toolbox'></div>
        <div class='pm-block pm-current-tool hidden'>
          <div class='icon'>
          </div>
          <div class='desc'>
            <span class='pm-current-tool-name'></span> 
          </div>
          <div style='clear: both'></div>
        </div>
      </div>
    "
    if @opts.position == 'top' or @opts.position == 'left'
      @toolboxEl = $(html).insertBefore(@wrapperEl).find('.pm-toolbox')
    else if @opts.position == 'right'
      @toolboxEl = $(html).insertAfter(@wrapperEl).find('.pm-toolbox')
    @currentToolNameEl = $(@toolboxEl).parent().find('.pm-current-tool-name')
    @currentToolEl = $(@toolboxEl).parent().find('.pm-current-tool')
    @containerEl = $('.pm-toolbox-wrapper, .canvas-container').wrapAll("<div class='pm-main-container pm-main-container-#{@opts.position}'></div>")

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
      self.toolbox[toolId].onChange(e) if toolId

    $(@containerEl).on 'mouseover', '.pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onMouseover(e)

    $(@containerEl).on 'mouseleave', '.pm-tool', (e) ->
      toolId = $(this).data('pmToolId')
      self.toolbox[toolId].onMouseleave(e)

    onKeyDownHandler = (e) ->
      switch e.keyCode
        when 46, 8
          if self.fCanvas.getActiveObject() or self.fCanvas.getActiveGroup()
            e.preventDefault()
            if self.activeTool
              self.activeTool.onBackspace(e)
            else
              activeObject = self.fCanvas.getActiveObject()
              self.fCanvas.remove activeObject
              if self.fCanvas.getActiveGroup()
                for activeGroupObject in self.fCanvas.getActiveGroup().objects
                  self.fCanvas.deactivateAll().remove(activeGroupObject).renderAll()
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
    @fCanvas.deactivateAll().renderAll()
    img = @fCanvas.toDataURL({
      format: format,
      left: 0,
      top: 0,
      width: @fCanvas.width,
      height: @fCanvas.height
    })
    return img

  setAttributeListeners: ->
    self = @
    for name, oldVal of @settings
      tmpname = name.toString()
      @testor(@settings, name)

  settingChanged: (name, oldVal, newVal) ->
    @activeTool.onSettingsChange()
    switch name
      when 'canvasWidth'
        @fCanvas.setWidth parseInt(newVal)
      when 'canvasHeight'
        @fCanvas.setHeight parseInt(newVal)
      when 'brushSize'
        @fCanvas.freeDrawingBrush.width = parseInt(newVal)
      when 'color'
        @fCanvas.freeDrawingBrush.color = parseInt(newVal)

  testor: (obj, propName) ->
    self = @
    savedVal = obj["#{propName}"]
    Object.defineProperty obj, propName, {
      get: ->
        obj["_#{propName}"]
      set: (newVal) ->
        newVal = parseInt(newVal)
        oldVal = obj["_#{propName}"]
        obj["_#{propName}"] = newVal
        self.settingChanged(propName, oldVal, newVal)
        event = new CustomEvent('pmSettingsChange', detail: { property: propName, oldVal: oldVal, newVal: newVal });
        document.dispatchEvent(event)
    }
    obj["_#{propName}"] = savedVal
