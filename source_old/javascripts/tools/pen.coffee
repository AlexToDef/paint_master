class Pen
  constructor: () ->
    @iconCode = '&#xEA05;'
    @iconSrc = 'icons/pen.svg'
    @iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAwklEQVQ4T52TYQ3CMBBG3xSAE5CAg80BQwGghOBgUwBTMHCABCSAA/KRNjmaFa7cvyZ9r+1314qymgMnYAWcgU1VxtMBa8MMXoFO3gJH4AIsosQjEDwCS3jfYG8k118CCz+BmZEog903gYV7bQbuQaKnaE1OkMJtOFkB6ibqwi0ncMNTgiI4FRTDVvAXbAUKRMMxAE0usKmpVReUqAZF9QhDIslH2rmRl0D9PCQbXHB8giaqNgI3HAX6HPHqykJrd70A06I+wCwcPxUAAAAASUVORK5CYII='
    @painting = false
    
  onmousedown: (paintable, event) ->
      context = paintable.context
      @painting = true
      @lastX = event.layerX
      @lastY = (event.layerY - window.pageYOffset)
      return
  onmousemove: (paintable, event) ->
    console.log event
    context = paintable.context
    if @painting == true
      context.beginPath()
      context.strokeStyle = paintable.toolbar.color
      context.lineWidth = 3
      context.lineJoin = 'round'
      context.moveTo @lastX, @lastY
      context.lineTo event.layerX, (event.layerY - window.pageYOffset)
      context.closePath()
      context.stroke()
    @lastX = event.layerX
    @lastY = (event.layerY - window.pageYOffset)
    return
  onmouseup: (paintable, event) ->
    context = paintable.context
    @painting = false
    return
  onPick: (paintable) =>
    #$('canvas').css('cursor', "url(#{@iconBase64}), auto")
    
window.PaintMe.Instruments.Pen = Pen