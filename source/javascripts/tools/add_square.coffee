window.PaintMasterPlugin.tools.AddSquare = class AddSquare extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Прямоугольник'
    @id = 'add-square'
    @active = false
    @canvas = @paintMaster.fCanvas
    super(@paintMaster)

  mousedown: (e) ->
    @canvas = @paintMaster.fCanvas
    mouse = @canvas.getPointer()
    @x = mouse.x
    @y = mouse.y
    return

  mousemove: (e) ->
    return

  mouseup: (e) ->
    return if @canvas.getActiveObject()
    mouse = @canvas.getPointer()
    currentX = mouse.x
    currentY = mouse.y
    height = Math.abs(@y - currentY)
    width = Math.abs(@x - currentX)

    if @x > currentX
      @x = currentX
    if @y > currentY
      @y = currentY
    square = new (fabric.Rect)(
      width: width
      height: height
      left: @x
      top: @y
      fill: '',
      stroke: @currentColor(),
      strokeWidth: @currentWidth())
    @paintMaster.fCanvas.add(square)
    @canvas.deactivateAll().renderAll()
    @canvas.setActiveObject(@canvas._objects[@canvas._objects.length - 1])
    return

  onClick: =>
    return
