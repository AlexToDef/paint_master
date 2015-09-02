window.PaintMasterPlugin.tools.AddSquare = class AddSquare extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Add Square'
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
    @paintMaster.fCanvas.add(square);
    return

  onClick: =>
    return
