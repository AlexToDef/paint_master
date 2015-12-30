window.PaintMasterPlugin.PaintMaster = class PaintMaster
  constructor: (@opts) ->
    @importModule 'CanvasElements'
    @importModule 'EventsListeners'
    @importModule 'AttributeEvents'

    @toolbox = {}
    @settings = {
      test: 1
    }
      # canvasWidth:  localStorage['pmAttr[canvasWidth]']  || @opts.width
      # canvasHeight: localStorage['pmAttr[canvasHeight]'] || @opts.height
      # fontSize:     localStorage['pmAttr[fontSize]']     || 16
      # brushSize:    localStorage['pmAttr[brushSize]']    || 5
      # color:        localStorage['pmAttr[color]']        || '#ff421f'

    @fCanvas = new fabric.Canvas(@opts.id)
    @fCanvas.freeDrawingBrush.color = @settings.color
    @fCanvas.freeDrawingBrush.width = @settings.brushSize
    @fCanvas.setWidth @settings.canvasWidth
    @fCanvas.setHeight @settings.canvasHeight
    @fCanvas.setBackgroundColor 'white'
    @fCanvas.renderAll()

    @canvas = @fCanvas

    @canvasWrapper = $(@fCanvas.wrapperEl)
    $(@canvasWrapper).wrapAll("<div class='pm-container'></div>")
    @wrapper = @canvasWrapper.parent()

    @drawToolbox()

    @setToolboxEventListeners()
    @setDrawListeners()

    @setWatchersOnCollection(@, @settings)

  importModule: (moduleName) ->
    for name, method of window.PaintMasterPlugin.modules[moduleName]
      @[name] = method

  drawToolbox: ->
    pmBarTop = "
      <div class='pm-bar pm-bar_top'>
        <div class='pm-toolbox'></div>
        <div class='pm-settings'></div>
      </div>
    "
    @topBar = $(pmBarTop).prependTo(@wrapper)
    @bottomBar = $("<div class='pm-bar pm-bar--bottom'><div class='pm-toolbox'></div></div>").appendTo(@wrapper)

    # @bottomBar = 
    # @currentToolNameEl = $(@toolboxEl).parent().find('.pm-current-tool-name')
    # @currentToolEl = $(@toolboxEl).parent().find('.pm-current-tool')
    @containerEl = $('.canvas-container')#$('.pm-toolbox-wrapper, .canvas-container').wrapAll("<div class='pm-main-container pm-main-container-#{@opts.position}'></div>")
    # @paletteEl = @toolboxEl.parent().find('.pm-palette')
    # @auxEl = @toolboxEl.parent().find('.pm-aux')

  setToolboxEventListeners: ->
    self = @
    $(@wrapper).on 'click', '.pm-toolbox .pm-toolbox__tool', (e) ->
      toolId = $(@).data('pmToolId')
      self.toolbox[toolId].onClick(e)
      if self.activeTool == self.toolbox[toolId]
        tool.deactivate() for key, tool of self.toolbox
        self.activeTool = null
      else
        self.toolbox[toolId].activate()
        self.activeTool = self.toolbox[toolId]

    $(@wrapper).on 'change', 'input', (e) ->
      toolId = $(@).parent().data('pmToolId')
      self.toolbox[toolId].onChange(e) if toolId

    $(@wrapper).on 'mouseover', '.pm-tool', (e) ->
      toolId = $(@).data('pmToolId')
      self.toolbox[toolId].onMouseover(e)

    $(@wrapper).on 'mouseleave', '.pm-tool', (e) ->
      toolId = $(@).data('pmToolId')
      self.toolbox[toolId].onMouseleave(e)

    $(window).on 'keydown', (e) ->
      console.log e.keyCode
      handler = self.keydown[e.keyCode]
      handler(e, self) if handler

  setDrawListeners: ->
    @canvas.observe 'mouse:down', (e) =>
      @activeTool.mousedown(e) if @activeTool and @activeTool.active
    @canvas.observe 'mouse:move', (e) =>
      @activeTool.mousemove(e) if @activeTool and @activeTool.active
    @canvas.observe 'mouse:up', (e) =>
      @activeTool.mouseup(e) if @activeTool and @activeTool.active


  addToolboxItem: (item, bar) ->
    item = new item(@)
    if bar == 'top'
      $(@topBar).find('.pm-toolbox').append(item.html)
    if bar == 'bottom'
      $(@bottomBar).find('.pm-toolbox').append(item.html)
    @toolbox[item.id] = item

  addSettingsItem: (item, bar) ->
    item = new window.PaintMasterPlugin.settings[item](@)
    $(@topBar).find('.pm-settings').append(item.html) if bar == 'top'
    item.included()
    item.registerCallbacks()
    @setWatcherOnCollectionElement(@, @settings, item.attributeName)

  addAdditionalToolboxItem: (item) ->
    item = new item(@)
    @additionalToolboxEl.append(item.html)
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

  drawAdditionalToolbox: ->
    html = "<div class='pm-additional-toolbox'></div>"
    @additionalToolboxEl = $(html).appendTo('.pm-main-container')
  
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
