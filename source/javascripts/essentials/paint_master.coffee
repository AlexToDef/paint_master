window.PaintMasterPlugin = {}
window.PaintMasterPlugin.tools = {}
window.PaintMasterPlugin.PaintMaster = class PaintMaster
  constructor: (@opts) ->
    @toolbox = {}

    @fCanvas = new fabric.Canvas(@opts.id)
    # img = new Image()
    # img.src = @opts.backgroundUrl
    # img.crossOrigin = 'anonymous'

    @wrapperEl = $(@fCanvas.wrapperEl)

    @drawToolbox()
    @setToolboxEventListeners()
    @setDrawListeners()
    # @setImagePasteListener()

    @fCanvas.setWidth 500
    @fCanvas.setHeight 500

    # img = new fabric.Image.fromURL(@opts.backgroundUrl, (->

    # ).bind(@))

    # @fCanvas.setBackgroundImage(img, (->
    #   # @fCanvas.renderAll

    #   # @fCanvas.isDrawingMode = false
    #   # @wrapperEl = $(@fCanvas.wrapperEl)

    #   # @drawToolbox()
    #   # @setToolboxEventListeners()
    #   # @setDrawListeners()

    #   # @fCanvas.setWidth 500
    #   # @fCanvas.setHeight 500

    #   img = @fCanvas.toDataURL({
    #         format: 'png',
    #         left: 0,
    #         top: 0,
    #         width: 10,
    #         height: 10,
    #         crossOrigin: 'anonymous'
    #       })
    #   @fCanvas.setBackgroundImage(img, (->
    #     console.log 'set'
    #   ).bind(@))
    # ).bind(@))

  # addCanvasToPaintable: ->
  #   @element = @opts['paintableElement']
  #   @canvasEl = $("<canvas id='#{@opts.id}'></canvas>").insertAfter(@element)
  #   @canvasEl.css
  #     top: 0
  #     bottom: 0
  #     left: 0
  #     outline: '1px solid #FF0000'
  #     position: 'absolute'
  #   console.log $(@element[0]).css('width')
  #   @canvasEl.attr
  #     width: @opts.width
  #     height: @opts.height
  #   @context = $(@canvasEl).get(0).getContext('2d')

  drawToolbox: ->
    console.log 'drawToolbox'
    console.log @wrapperEl
    html = "<div class='pm-toolbox pm-toolbox-bottom'></div>"
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
        # tool.deactivate() for key, tool of self.toolbox
        self.toolbox[toolId].activate()
        self.activeTool = self.toolbox[toolId]

    $(@wrapperEl).on 'change', 'input', (e) ->
      toolId = $(this).parent().data('pmToolId')
      self.toolbox[toolId].onChange(e)

    onKeyDownHandler = (e) ->
      switch e.keyCode
        when 46
          e.preventDefault()
          activeObject = self.fCanvas.getActiveObject()
          self.fCanvas.remove activeObject
    window.onkeydown = onKeyDownHandler

  setDrawListeners: ->
    @fCanvas.observe 'mouse:down', (e) =>
      @activeTool.mousedown(e) if @activeTool and @activeTool.active
    @fCanvas.observe 'mouse:move', (e) =>
      @activeTool.mousemove(e) if @activeTool and @activeTool.active
    @fCanvas.observe 'mouse:up', (e) =>
      @activeTool.mouseup(e) if @activeTool and @activeTool.active

  # setImagePasteListener: ->
  #   self = @
  #   pasteImage = (event) ->
  #     cbData = event.clipboardData
  #     i = 0
  #     while i < cbData.items.length
  #       cbDataItem = cbData.items[i]
  #       type = cbDataItem.type
  #       if type.indexOf('image') != -1
  #         imageData = cbDataItem.getAsFile()
  #         imageURL = window.webkitURL.createObjectURL(imageData)
  #         self.onImagePaste(imageURL)
  #       i++
  #     return
  #   window.addEventListener("paste", pasteImage);

  # onImagePaste: (imageURL) ->
  #   img = new fabric.Image.fromURL(imageURL, ((imgFromURL)->
  #     @fCanvas.setBackgroundImage(imgFromURL, (->
  #       @fCanvas.renderAll()
  #     ).bind(@))
  #   ).bind(@))

  addToolboxItem: (item) ->
    item = new item(@)
    @toolboxEl.append(item.html)
    @toolbox[item.id] = item

  removeToolboxItem: (itemId) ->
    @toolbox[itemId].onRemove()
    delete @toolbox[itemId]


