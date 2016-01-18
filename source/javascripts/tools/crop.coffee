window.PaintMasterPlugin.tools.Crop = class Crop extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Обрезать картинку'
    @help = 'Выберите участок, который должен остаться </br> <b>Enter</b> - применить </br> <b>Backspace</b> - отмена'
    @id = 'crop'
    @canvas = @paintMaster.fCanvas
    @shadeFill = '#5e5e5e'
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
      height: parseInt(@canvas.getHeight()),
      width: xx + 0.25,
      left: 0,
      top: 0
    )

    @topBlindZone = @addBlindZone(
      height: xy - @trueSight.height + 0.25,
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
      width: @trueSight.width * @trueSight.scaleX + 0.25,
      left: xx,
      top: xy
    )

  addBlindZone: (params) ->
    console.log 'add blind zone'
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
    xx = Math.round( @trueSight.left )
    xy = Math.round( @trueSight.left + @trueSight.getWidth() )
    yy = Math.round( @trueSight.top )
    yx = Math.round( @trueSight.top + @trueSight.getHeight() )

    xx = Math.round(@trueSight.left, 2)
    xy = Math.round(@trueSight.left + @trueSight.getWidth(), 2)
    yy = Math.round(@trueSight.top, 2)
    yx = Math.round(@trueSight.top + @trueSight.getHeight(), 2)

    trueSightWidth = @trueSight.getWidth()

    differ = trueSightWidth + xx + @paintMaster.settings.canvasWidth - xy
    differ = 0

    mdif = @paintMaster.settings.canvasWidth - (xx + (@paintMaster.settings.canvasWidth - @topBlindZone.left))
    mdif = 0

    @leftBlindZone.set('width', if xx > 0 then xx + 0.25 else 0)
    @topBlindZone.set('height', if yy > 0 then yy + 0.25 else 0).set('left', xx)
    @rightBlindZone.set('left', xy).set('width', parseFloat(@paintMaster.settings.canvasWidth) - xy).set('top', yy)
    @bottomBlindZone.set('width', trueSightWidth + 0.25).set('left', xx).set('top', yx)

  onSubmit: (e) ->
    width = @trueSight.getWidth()
    height = @trueSight.getHeight()
    left = @trueSight.left
    top = @trueSight.top
    ctx = @canvas.contextTop || @canvas.contextContainer

    if top < 0
      height = height + top
      top = 0
    if left < 0
      width = width + left
      left = 0
    if (top + height) > parseFloat(@canvas.getHeight())
      height = @canvas.height - top
      top = @canvas.getHeight() - height
    if (left + width) > parseFloat(@canvas.getWidth())
      width = @canvas.getWidth() - left
      left = @canvas.getWidth() - width

    @canvas.deactivateAll().renderAll()

    @canvas.remove @leftBlindZone
    @canvas.remove @topBlindZone
    @canvas.remove @rightBlindZone
    @canvas.remove @bottomBlindZone

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


