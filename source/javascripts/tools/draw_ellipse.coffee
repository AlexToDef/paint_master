window.PaintMasterPlugin.tools.DrawEllipse = class DrawEllipse extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Окружность'
    @id = 'draw-ellipse'
    super(@paintMaster)

  onClick: =>
    return
    if @active == true
      @paintMaster.wrapperEl.find(".pm-tool.#{@id}").addClass('active')
    else
      @paintMaster.wrapperEl.find(".pm-tool.#{@id}").removeClass('active')

  mousedown: (e) ->
    @drawing = true
    @lockDrag()
    @canvas = @paintMaster.fCanvas
    mouse = @canvas.getPointer(e.e)
    @y = mouse.y
    @x = mouse.x

    circle = new fabric.Ellipse
      rx: 1
      ry: 1
      left: @x
      top: @y
      fill: ''
      stroke: @currentColor()
      strokeWidth: @currentWidth()

    @canvas.add(circle).renderAll().setActiveObject(circle)

  mousemove: (e) ->
    return unless @drawing
    currentX = @canvas.getPointer(e.e).x
    currentY = @canvas.getPointer(e.e).y
    circle = @canvas.getActiveObject()

    rx = Math.abs(currentX - (@x))/2
    ry = Math.abs(currentY - (@y))/2

    circle.set 'rx', rx
    circle.set 'ry', ry
    circle.set 'left', currentX if @x > currentX
    circle.set 'top', currentY if @y > currentY

    @canvas.renderAll()

  mouseup: (e) ->
    @drawing = false
    aCircle = @canvas.getActiveObject(); 

    circle = new fabric.Ellipse
      rx: aCircle.rx
      ry: aCircle.ry
      left: aCircle.left
      top: aCircle.top
      fill: ''
      stroke: @currentColor()
      strokeWidth: @currentWidth()

    @canvas.add(circle).renderAll()
    @canvas.remove @canvas.getActiveObject()
    @canvas.setActiveObject(circle)

    @unlockDrag()
    @canvas.deactivateAll().renderAll()

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
    @canvas.deactivateAll().renderAll()
    @canvas.setActiveObject(@canvas._objects[@canvas._objects.length - 1]) if rx > 0 or ry > 0



