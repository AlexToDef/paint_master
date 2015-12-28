window.PaintMasterPlugin.tools.DrawRect = class DrawRect extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Прямоугольник'
    @id = 'draw-rect'
    @active = false
    @canvas = @paintMaster.fCanvas
    super(@paintMaster)

  activate: ->
    super()
    @lockDrag()
    @displayPalette()
    @setAuxDisplay '.pm-aux__control-brush-size', 'block'

  deactivate: ->
    super()
    @unlockDrag()
    @hidePalette()
    @setAuxDisplay '.pm-aux__control-brush-size', 'none'

  mousedown: (e) ->
    @drawing = true
    @lockDrag()
    @canvas.deactivateAll().renderAll()
    @canvas = @paintMaster.fCanvas
    mouse = @canvas.getPointer(e.e)
    @x = mouse.x
    @y = mouse.y

    square = new fabric.Rect
      width: 10
      height: 10
      left: @x
      top: @y
      fill: ''
      stroke: @paintMaster.settings.color
      strokeWidth: parseInt(@paintMaster.settings.brushSize)

    @canvas.add(square).renderAll().setActiveObject(square)

  mousemove: (e) ->
    return unless @drawing
    mouse = @canvas.getPointer(e.e)
    currentX = mouse.x
    currentY = mouse.y
    console.log currentX, currentY
    height = Math.round(Math.abs(@y - currentY))
    width = Math.round(Math.abs(@x - currentX))

    square = @canvas.getActiveObject(); 

    square.set('width', width)
    square.set('left', @x - width) if @x > currentX
    console.log "left: #{@x - width}"
    square.set('height', height)
    square.set('top', @y - height) if @y > currentY
      
    @canvas.renderAll()

  mouseup: (e) ->
    @drawing = false
    aSquare = @canvas.getActiveObject(); 

    square = new fabric.Rect
      width: aSquare.width
      height: aSquare.height
      left: aSquare.left
      top: aSquare.top
      fill: ''
      stroke: @paintMaster.settings.color
      strokeWidth: parseInt(@paintMaster.settings.brushSize)

    @canvas.add(square).renderAll()
    @canvas.remove @canvas.getActiveObject()
    @canvas.setActiveObject(square)

    if aSquare.width == 10 and aSquare.height == 10
      @canvas.remove @canvas.getActiveObject()
      return

    @lockDrag()
    @canvas.deactivateAll().renderAll()


  onClick: =>
    return
