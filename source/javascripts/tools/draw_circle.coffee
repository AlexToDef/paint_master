window.PaintMasterPlugin.tools.DrawCircle = class DrawCircle extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Draw Circle'
    @id = 'draw-circle'
    super(@paintMaster)

  onClick: =>
    return
    if @active == true
      @paintMaster.wrapperEl.find(".pm-tool.#{@id}").addClass('active')
    else
      @paintMaster.wrapperEl.find(".pm-tool.#{@id}").removeClass('active')

  mousedown: (e) ->
    @canvas = @paintMaster.fCanvas
    mouse = @canvas.getPointer()
    @x = mouse.x
    @y = mouse.y

  mousemove: (e) ->
    1

  mouseup: (e) ->
    @canvas = @paintMaster.fCanvas
    mouse = @canvas.getPointer()

    @addCircleToCanvas(@x, @y, mouse.x, mouse.y)

  addCircleToCanvas: (startX, startY, currentX, currentY) ->
    rx = Math.abs(currentX - startX)/2
    ry = Math.abs(currentY - startY)/2

    startX = currentX if startX > currentX
    startY = currentY if startY > currentY
    circle = new fabric.Ellipse
      top : startY,
      left : startX,
      rx: rx,
      ry: ry,
      stroke: @currentColor(),
      fill: '',
      strokeWidth: @currentWidth()
    @canvas.add circle



