class StartCrop
  constructor: ->
    @iconCode = '&#xEA06;'
    @iconSrc = 'icons/rectShape.svg'
    @iconBase64 = ''
    @painting = false

    @setListener()
    
  onmousedown: (paintable, event) ->
    context = paintable.context
    @painting = true
    @startX = event.layerX || 0
    @startY = event.layerY || 0
    @startY -= window.pageYOffset
    @previousState = context.canvas.toDataURL()
    @initialImage = new Image
    @initialImage.src = @previousState

  onmousemove: (paintable, event) ->
    context = paintable.context
    if @painting == true
      context.drawImage @initialImage, 0, 0
      context.beginPath()
      context.strokeStyle = paintable.toolbar.color
      context.rect @startX, @startY, event.layerX - @startX, event.layerY - @startY - window.pageYOffset
      context.stroke()
      context.closePath()

  onmouseup: (paintable, event) ->
    context = paintable.context
    @painting = false
    
  onPick: (paintable) ->
    # $('canvas').css('cursor', "url(#{@iconBase64}), auto")
    $(document).trigger('startCrop', [paintable]);

  setListener: () ->
    $( document ).on 'startCrop', ->
      foo: "bar"
    , (event, arg1) ->
      console.log event.data
      console.log arg1

    
window.PaintMe.Instruments.Crop = StartCrop