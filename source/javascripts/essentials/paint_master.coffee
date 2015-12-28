window.PaintMasterPlugin = {}
window.PaintMasterPlugin.tools = {}
window.PaintMasterPlugin.PaintMaster = class PaintMaster
  constructor: (@opts) ->
    @toolbox = {}
    @settings =
      canvasWidth: localStorage['pmAttr[canvasWidth]'] || @opts.width
      canvasHeight: localStorage['pmAttr[canvasHeight]'] || @opts.height
      fontSize: localStorage['pmAttr[fontSize]'] || 16
      brushSize: localStorage['pmAttr[brushSize]'] || 5
      color: localStorage['pmAttr[color]'] || '#ff421f'

    @fCanvas = new fabric.Canvas(@opts.id)
    @fCanvas.freeDrawingBrush.color = @settings.color
    @fCanvas.freeDrawingBrush.width = @settings.brushSize

    @wrapperEl = $(@fCanvas.wrapperEl)

    @drawToolbox()
    @drawAdditionalToolbox()
    @drawPalette()
    @drawBrushSizeControl()
    @drawCanvasWidthControl()
    @drawCanvasHeightControl()
    @drawFontSizeControl()
    @setToolboxEventListeners()
    @setDrawListeners()
    @setAttributeListeners()

    @fCanvas.setWidth @settings.canvasWidth
    @fCanvas.setHeight @settings.canvasHeight
    @fCanvas.setBackgroundColor 'white'
    @fCanvas.renderAll()

  drawToolbox: ->
    html = "
      <div class='pm-toolbox-wrapper pm-toolbox-#{@opts.position}'>
        <div class='pm-toolbox'></div>
        <div class='pm-palette'></div>
        <div class='pm-aux'></div>
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
    @paletteEl = @toolboxEl.parent().find('.pm-palette')
    @auxEl = @toolboxEl.parent().find('.pm-aux')

  drawAdditionalToolbox: ->
    html = "<div class='pm-additional-toolbox'></div>"

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
      console.log e.keyCode
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
          if self.fCanvas.getActiveObject()
            self.fCanvas.getActiveObject().lockMovementX = !self.fCanvas.getActiveObject().lockMovementX
            self.fCanvas.getActiveObject().lockMovementY = !self.fCanvas.getActiveObject().lockMovementY 
            self.fCanvas.getActiveObject().cornerColor = if self.fCanvas.getActiveObject().lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'
            self.fCanvas.getActiveObject().borderColor = if self.fCanvas.getActiveObject().lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'
            self.fCanvas.renderAll()
          if self.fCanvas.getActiveGroup()
            for activeGroupObject in self.fCanvas.getActiveGroup().objects
              # activeGroupObject.selectable = false
              activeGroupObject.lockMovementX = true
              activeGroupObject.lockMovementY = true
              activeGroupObject.cornerColor = if activeGroupObject.lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'
              activeGroupObject.borderColor = if activeGroupObject.lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'
            self.fCanvas.renderAll()
        when 27
          self.fCanvas.deactivateAll().remove(activeGroupObject).renderAll()
          self.activeTool.deactivate() if self.activeTool

              
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
      @setAttributeWatchers(@settings, name)

  settingChanged: (name, oldVal, newVal) ->
    @activeTool.onSettingsChange() if @activeTool
    switch name
      when 'canvasWidth'
        @fCanvas.setWidth parseInt(newVal)
      when 'canvasHeight'
        @fCanvas.setHeight parseInt(newVal)
      when 'brushSize'
        @fCanvas.freeDrawingBrush.width = parseInt(newVal)
      when 'color'
        @fCanvas.freeDrawingBrush.color = parseInt(newVal)

  setAttributeWatchers: (obj, propName) ->
    self = @
    savedVal = obj["#{propName}"]
    Object.defineProperty obj, propName, {
      get: ->
        obj["_#{propName}"]
      set: (newVal) ->
        oldVal = obj["_#{propName}"]
        obj["_#{propName}"] = newVal
        self.settingChanged(propName, oldVal, newVal)
        event = new CustomEvent('pmSettingsChange', detail: { property: propName, oldVal: oldVal, newVal: newVal });
        document.dispatchEvent(event)
        window.localStorage["pmAttr[#{propName}]"] = newVal
    }
    obj["_#{propName}"] = savedVal
  
  drawPalette: ->
    self = @
    colors = ['#ff421f', '#00e535', '#000000', '#ff4f81', '#fff24d', '#0096e7', '#919191', '#ffffff']
    html = "#{(@renderColorItem(color) for color in colors).join('')}"
    @paletteEl.append html
    $(@paletteEl).on 'click', '.pm-palette__item', (e) ->
      $(self.paletteEl).find('.pm-palette__item').removeClass('pm-palette__item-active')
      $(this).addClass('pm-palette__item-active')
      self.settings.color = $(@).find('div').data('color')
      self.fCanvas.freeDrawingBrush.color = $(@).find('div').data('color')

  drawBrushSizeControl: ->
    self = @
    html = "
      <div class='pm-aux__control pm-aux__control-brush-size'>
        <label> Размер кисти: <span>#{parseInt(@settings.brushSize)}</span> </label>
        <input type='range' min='1' max='100' value='#{parseInt(@settings.brushSize)}'>
      </div>"
    @auxEl.prepend html
    $(@auxEl).on 'input', '.pm-aux__control-brush-size input', (e) ->
      $(self.auxEl).find('.pm-aux__control-brush-size label span').html(e.currentTarget.valueAsNumber)
      self.settings.brushSize = e.currentTarget.valueAsNumber

  drawFontSizeControl: ->
    self = @
    html = "
      <div class='pm-aux__control pm-aux__control-font-size'>
        <label> Размер шрифта: <span>#{parseInt(@settings.fontSize)}</span> </label>
        <input type='range' min='1' max='100' value='#{parseInt(@settings.fontSize)}'>
      </div>"
    @auxEl.prepend html
    $(@auxEl).on 'input', '.pm-aux__control-font-size input', (e) ->
      $(self.auxEl).find('.pm-aux__control-font-size label span').html(e.currentTarget.valueAsNumber)
      self.settings.fontSize = e.currentTarget.valueAsNumber

  drawCanvasWidthControl: ->
    self = @
    html = "
      <div class='pm-aux__control pm-aux__control-canvas-width'>
        <label> Ширина холста: </label>
        <input type='number' min='1' max='4000' value='#{parseInt(@settings.canvasWidth)}'>
      </div>"
    @auxEl.prepend html
    $(@auxEl).on 'change', '.pm-aux__control-canvas-width input', (e) ->
      self.settings.canvasWidth = e.currentTarget.valueAsNumber
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'canvasWidth'
        $('.pm-aux__control-canvas-width input').val(e.originalEvent.detail.newVal)

  drawCanvasHeightControl: ->
    self = @
    html = "
      <div class='pm-aux__control pm-aux__control-canvas-height'>
        <label> Высота холста: </span> </label>
        <input type='number' min='1' max='4000' value='#{parseInt(@settings.canvasHeight)}'>
      </div>"
    @auxEl.prepend html
    $(@auxEl).on 'change', '.pm-aux__control-canvas-height input', (e) ->
      self.settings.canvasHeight = e.currentTarget.valueAsNumber
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'canvasHeight'
        $('.pm-aux__control-canvas-height input').val(e.originalEvent.detail.newVal)

  renderColorItem: (color) ->
    return "<div class='pm-palette__item #{if @settings.color == color then 'pm-palette__item-active' else ''}'> <div style='background-color: #{color}' data-color='#{color}'> </div> </div>"
