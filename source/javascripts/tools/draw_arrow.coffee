strSVG = '<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   width="268.832px" height="268.832px" viewBox="0 0 268.832 268.832" style="enable-background:new 0 0 268.832 268.832;"
   xml:space="preserve">
<g>
  <path d="M223.255,167.493c-4.881-4.882-12.797-4.882-17.678,0l-58.661,58.661V12.5c0-6.903-5.598-12.5-12.5-12.5
    c-6.904,0-12.5,5.597-12.5,12.5v213.654l-58.661-58.659c-4.883-4.881-12.797-4.881-17.678,0c-4.883,4.882-4.883,12.796,0,17.678
    l80,79.998c2.439,2.44,5.64,3.661,8.839,3.661s6.397-1.221,8.839-3.661l80-80C228.137,180.289,228.137,172.375,223.255,167.493z"/>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>
'

window.PaintMasterPlugin.tools.DrawArrow = class DrawArrow extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Стрелка'
    @id = 'draw-arrow'
    @active = false
    @canvas = @paintMaster.fCanvas
    super(@paintMaster)

  activate: ->
    super()
    @lockDrag()
    @displaySettings ['color', 'brushSize']

  deactivate: ->
    super()
    @unlockDrag()
    @hideSettings ['color', 'brushSize']

  mousedown: (e) ->
    @canvas.deactivateAll()
    @initialMouse = @canvas.getPointer(e.e)
    self = @
    fabric.loadSVGFromString strSVG, (arrow) ->
      arrow = arrow[0]
      arrow.fill = self.paintMaster.settings.color
      arrow.top = self.initialMouse.y
      arrow.left = self.initialMouse.x
      arrow.originX = 'center'
      arrow.originY = 'top'
      arrow.angle = 10
      arrow.scaleX = 0.1 * parseInt(self.paintMaster.settings.brushSize)
      arrow.scaleY = 0.1
      self.initialHeight = arrow.height
      self.canvas.add(arrow).renderAll()
      self.canvas.setActiveObject(arrow)
    @drawing = true

  mousemove: (e) ->
    return unless @drawing
    arrow = @canvas.getActiveObject()
    mouse = @canvas.getPointer(e.e)
    currentX = mouse.x
    currentY = mouse.y

    deltaY = currentY - @initialMouse.y
    deltaX = currentX - @initialMouse.x
    angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI - 90
    distance = Math.sqrt(Math.abs(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)))

    deltaHeight = @initialHeight - distance
    proption = Math.abs(distance / @initialHeight)

    arrow.set('angle', angleInDegrees)
    arrow.set('scaleY', proption)

    @aArrow = arrow
      
    @canvas.renderAll()

  mouseup: (e) ->
    @drawing = false
    @canvas.remove @canvas.getActiveObject()
    @canvas.add(@aArrow)
    @canvas.setActiveObject(@aArrow)

    @lockDrag()
    @canvas.deactivateAll().renderAll()

  onClick: =>
    return
