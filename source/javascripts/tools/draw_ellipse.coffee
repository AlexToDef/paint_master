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

  activate: ->
    super()
    @displaySettings ['color', 'brushSize']

  deactivate: ->
    super()
    @hideSettings ['color', 'brushSize']

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
      stroke: @paintMaster.settings.color
      strokeWidth: parseInt(@paintMaster.settings.brushSize)

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
    console.log 123
    @drawing = false
    aCircle = @canvas.getActiveObject(); 

    circle = new fabric.Ellipse
      rx: aCircle.rx
      ry: aCircle.ry
      left: aCircle.left
      top: aCircle.top
      fill: ''
      stroke: @paintMaster.settings.color
      strokeWidth: parseInt(@paintMaster.settings.brushSize)

    @canvas.add(circle).renderAll()
    @canvas.remove @canvas.getActiveObject()
    @canvas.setActiveObject(circle)

    if aCircle.rx == 1 and aCircle.ry == 1
      @canvas.remove @canvas.getActiveObject()
      return

    @unlockDrag()
    @canvas.deactivateAll().renderAll()

  # addCircleToCanvas: (startX, startY, currentX, currentY) ->
  #   console.log 123
  #   rx = Math.abs(currentX - startX)/2
  #   ry = Math.abs(currentY - startY)/2

  #   startX = currentX if startX > currentX
  #   startY = currentY if startY > currentY
  #   circle = new fabric.Ellipse
  #     top : startY,
  #     left : startX,
  #     rx: rx,
  #     ry: ry,
  #     stroke: @currentColor(),
  #     fill: '',
  #     strokeWidth: @currentWidth()
  #   @canvas.add circle
  #   @canvas.deactivateAll().renderAll()
  #   @canvas.setActiveObject(@canvas._objects[@canvas._objects.length - 1]) if rx > 0 or ry > 0
  #   @canvas.remove @canvas.getActiveObject()
  #   console.log 111
  #   if rx == 1 and ry == 1
  #     @canvas.remove @canvas.getActiveObject()
  #     return



