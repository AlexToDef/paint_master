class CircleShape
  constructor: ->
    @iconCode = '&#xEA01;'
    @iconSrc = 'icons/circle_shape.svg'
    @iconBase64 = ''
    @painting = false
    
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
      context.beginPath();
      #context.arc(@startX + (event.layerX - @startX), @startY + (event.layerX - @startX), event.layerX - @startX, 0, 2 * Math.PI, false);
      context.arc(@startX, @startY, Math.abs(event.layerX - @startX), 0, 2 * Math.PI, false)
      context.lineWidth = 5;
      context.strokeStyle = paintable.toolbar.color;
      context.stroke();

  onmouseup: (paintable, event) ->
    context = paintable.context
    @painting = false

  onPick: (paintable) ->
    #$('canvas').css('cursor', "url(#{@iconBase64}), auto")

    
window.PaintMe.Instruments.CircleShape = CircleShape