window.PaintMe = {}
window.PaintMe.Instruments = {}
window.PaintMe.Actions = {}
window.PaintMe.Painter = class Painter
  constructor: (opts) ->
    @opts = opts
    @previousStates = []
    @undoneStates = []
    if @opts['applyOnImage']
      @addCanvasToPaintable()
      @setCanvasImage()
      @createToolset()
      @enablePainting()
    if @opts['applyOnCanvas']
      @canvas = @opts.canvas
      @element = @opts.element
      @context = $(@canvas).get(0).getContext('2d')
      @setCanvasImage()
      @createToolset()
      @enablePainting()

  addCanvasToPaintable: ->
    @element = @opts['paintableElement']
    @canvas = $('<canvas></canvas>').insertAfter(@element)
    @canvas.css
      top: 0
      bottom: 0
      left: 0
      outline: '1px solid #FF0000'
      position: 'absolute'
    @canvas.attr
      width: $(@element[0]).width()
      height: $(@element[0]).height()
    @context = $(@canvas).get(0).getContext('2d')

  createToolset: ->
    @toolbar = new window.PaintMe.Toolbar(@)

  setCanvasImage: ->
    @originalImage = new Image
    @originalImage.setAttribute('crossOrigin', 'anonymous');
    @originalImage.src = $(@element).attr('src')
    #@originalImage.width = 600
    #@originalImage.height = 700
    @originalImage.onload = =>
      @context.drawImage @originalImage, 0, 0, @element.width(), @element.height()

  enablePainting: =>
    $(@canvas)[0].onmousedown = (event) =>
      return unless @toolbar.tool and @toolbar.color
      selectedTool = @toolbar.tool
      selectedTool.onmousedown @, event
      @previousStates.push @context.canvas.toDataURL()
    $(@canvas)[0].onmousemove = (event) =>
      return unless @toolbar.tool and @toolbar.color
      selectedTool = @toolbar.tool
      selectedTool.onmousemove @, event
    $(@canvas)[0].onmouseup = (e) =>
      return unless @toolbar.tool and @toolbar.color
      selectedTool = @toolbar.tool
      selectedTool.onmouseup @, event

  undo: =>
    if @previousStates.length > 0
      previousState = @previousStates.pop()
      @undoneStates.push @context.canvas.toDataURL()
      imageObj = new Image
      imageObj.src = previousState
      @context.drawImage imageObj, 0, 0
  redo: =>
    if @undoneStates.length > 0
      undoneState = @undoneStates.pop()
      @previousStates.push @context.canvas.toDataURL()
      imageObj = new Image
      imageObj.src = undoneState
      @context.drawImage imageObj, 0, 0
      
  reset: =>
    @context.drawImage @originalImage, 0, 0  
    
  saveState: =>
    @previousStates.push @context.canvas.toDataURL()  
    
  dismiss: =>
    @canvas.remove()
    @toolbar.dismiss()
    