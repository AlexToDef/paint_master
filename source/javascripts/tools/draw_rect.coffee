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

  deactivate: ->
    super()
    @unlockDrag()

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
      stroke: @currentColor()
      strokeWidth: @currentWidth()

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
      stroke: @currentColor()
      strokeWidth: @currentWidth()


    @canvas.add(square).renderAll()
    @canvas.remove @canvas.getActiveObject()
    @canvas.setActiveObject(square)

    @lockDrag()
    @canvas.deactivateAll().renderAll()


  onClick: =>
    return
