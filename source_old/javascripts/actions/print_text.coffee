class CanvasTextArea
  constructor: (canvas, coords, opts) ->
    @canvas = canvas
    @context = canvas.context
    @text = []
    @opts = opts
    @startX = coords[0]
    @startY = coords[1]
    @lastX = coords[2]
    @lastY = coords[3]
    @width = @lastX - @startX
    @height = @lastY - @startY
    
  printChar: (char) ->
    @text += char
    span = $("<span style='display: none'>#{@text}</span>")
    $('body').append(span)
    width = span.width()
    span.remove()
    console.log "Text: #{@text}"
    console.log "Text width: #{width}"
    @context.fillStyle = 'red'
    @context.font = 'bold 16px Arial'
    @context.fillText(@text, @startX, @startY)
    

class SelectTextZone
  constructor: (paintObj) ->
    console.log 'SelectTextZone constr'
    @iconSrc = 'icons/pen.svg'
    @iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAwklEQVQ4T52TYQ3CMBBG3xSAE5CAg80BQwGghOBgUwBTMHCABCSAA/KRNjmaFa7cvyZ9r+1314qymgMnYAWcgU1VxtMBa8MMXoFO3gJH4AIsosQjEDwCS3jfYG8k118CCz+BmZEog903gYV7bQbuQaKnaE1OkMJtOFkB6ibqwi0ncMNTgiI4FRTDVvAXbAUKRMMxAE0usKmpVReUqAZF9QhDIslH2rmRl0D9PCQbXHB8giaqNgI3HAX6HPHqykJrd70A06I+wCwcPxUAAAAASUVORK5CYII='
    @painting = false
    $('body').on 'keydown', (e) =>
      console.log 132131
      
    
  onmousedown: (paintable, event) ->
    console.log 'test'
    @painting = true
    @startX = event.layerX || 0
    @startY = event.layerY || 0
    @initialImage = new Image
    @initialImage.src = paintable.context.canvas.toDataURL()
    $('body').on 'keydown', (e) =>
      if @textArea
        @textArea.printChar(String.fromCharCode(e.keyCode))
      
  onmousemove: (paintable, event) ->
    context = paintable.context
    if @painting == true
      context.drawImage @initialImage, 0, 0
      context.beginPath()
      context.strokeStyle = paintable.toolbar.color
      context.rect @startX, @startY, event.layerX - @startX, event.layerY - @startY
      context.stroke()
      context.closePath()

  onmouseup: (paintable, event) ->
    context = paintable.context
    @painting = false
    @textArea = new CanvasTextArea(paintable, [@startX, @startY, event.layerX - @startX, event.layerY - @startY], {})

  onPick: (paintable) =>
    1
    #$('canvas').css('cursor', "url(#{@iconBase64}), auto")
  #printChar: (char) ->
    #console.log char
    #
  

class PrintText
  constructor:  ->
    @iconCode = '&#xEA01;'  
    @iconSrc = 'icons/1.svg'

  apply: (paintable) ->
    @paintable = paintable
    @addTextControls()
    
  addTextControls: (toolbarElement) ->
    name = 'SelectTextZone'
    textControl = $("<div class='controls text'></div>").appendTo(@paintable.toolbar.element)
    textControl.append($('<div class="tool" data-name="' + name + '">' + '13123123' + '</div>'))
    @paintable.toolbar.includeTool(name, SelectTextZone)
    #textControl.append()
    
    
window.PaintMe.Actions.PrintText = PrintText