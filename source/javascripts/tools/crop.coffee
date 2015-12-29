window.PaintMasterPlugin.tools.Crop = class Crop extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Обрезать картинку'
    @help = 'Выберите участок, который должен остаться </br> <b>Enter</b> - применить </br> <b>Backspace</b> - отмена'
    @id = 'crop'
    @canvas = @paintMaster.fCanvas
    @shadeFill = '5E5E5E'
    @shadeOpacity = 0.7
    super(@paintMaster)

  activate: ->
    super()
    @trueSight = new (fabric.Rect)(
      width: @canvas.width
      height:  @canvas.height
      left: 50
      top: 50
      width: 100
      height: 100
      fill: ''
      lockRotation: true
    )
    @canvas.add(@trueSight)
    ts = @trueSight

    @addBlindZones()
    @canvas.moveTo(@trueSight, @canvas._objects.length)
    @canvas.setActiveObject(@trueSight)

  deactivate: ->
    super()
    @paintMaster.removeToolboxItem 'accept-crop' if @paintMaster.toolbox['accept-crop']
    @canvas.remove @trueSight
    @canvas.remove @leftBlindZone
    @canvas.remove @topBlindZone
    @canvas.remove @rightBlindZone
    @canvas.remove @bottomBlindZone

  mousedown: (e) ->
    mouse = @canvas.getPointer(e)
    @x = mouse.x
    @y = mouse.y

  mousemove: (e) ->
    @moveBlindZones()

  mouseup: (e) ->
    mouse = @canvas.getPointer(e)
    @addRectToCanvas(@x, @y, mouse.x, mouse.y)

  addRectToCanvas: (startX, startY, currentX, currentY) ->
    return

  addBlindZones: ->
    xx = @trueSight.left
    xy = @trueSight.left + @trueSight.width
    yy = @trueSight.top
    yx = @trueSight.top + @trueSight.height
    @leftBlindZone = @addBlindZone(
      height: @canvas.height,
      width: xx,
      left: 0,
      top: 0
    )

    @topBlindZone = @addBlindZone(
      height: xy - @trueSight.height,
      width: @canvas.width*2,
      left: xx,
      top: 0
    )

    @rightBlindZone = @addBlindZone(
      height: @canvas.height*2,
      width: @canvas.width - xy,
      left: xy,
      top: yy
    )

    @bottomBlindZone = @addBlindZone(
      height: @canvas.height*2,
      width: @trueSight.width * @trueSight.scaleX,
      left: xx,
      top: xy
    )

  addBlindZone: (params) ->
    shade = new (fabric.Rect)(
      width: params.width,
      height: params.height,
      left: params.left,
      top: params.top,
      fill: @shadeFill,
      opacity: @shadeOpacity,
      lockMovementX: true,
      lockMovementY: true,
      selectable: false
    )
    @canvas.add(shade)
    shade

  moveBlindZones: ->
    xx = @trueSight.left
    xy = @trueSight.left + @trueSight.width * @trueSight.scaleX
    yy = @trueSight.top
    yx = @trueSight.top + @trueSight.height * @trueSight.scaleY

    @leftBlindZone.set('width', xx)
    @topBlindZone.set('height', yy).set('left', xx)
    @rightBlindZone.set('left', xy).set('width', @canvas.width - xy).set('top', yy)
    @bottomBlindZone.set('width', @trueSight.width * @trueSight.scaleX).set('left', xx).set('top', yx)

  onSubmit: (e) ->
    width = @trueSight.width * @trueSight.scaleX
    height = @trueSight.height * @trueSight.scaleY
    left = @trueSight.left
    top = @trueSight.top
    scaleX = @trueSight.scaleX
    scaleY = @trueSight.scaleY
    ctx = @canvas.contextTop || @canvas.contextContainer

    if top < 0
      height = height + top
      top = 0
    if left < 0
      width = width + left
      left = 0
    if (top + height) > @canvas.height
      height = @canvas.height - top
      top = @canvas.height - height
    if (left + width) > @canvas.width
      width = @canvas.width - left
      left = @canvas.width - width

    @canvas.deactivateAll().renderAll()

    img = @canvas.toDataURL({
      left: left,
      top: top,
      width: width,
      height: height,
      crossOrigin: 'anonymous'
    })

    @canvas.clear().renderAll()

    @paintMaster.settings.canvasWidth = width
    @paintMaster.settings.canvasHeight = height

    @canvas.setBackgroundImage img, (->
      @renderAll()
    ).bind(@canvas)
    super()
    @deactivate()

  onBackspace: (e) ->
    @deactivate()


