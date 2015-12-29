switchActiveElementLock = (canvas) ->
  @switchElementLock(canvas.getActiveObject())
  canvas.renderAll() 

switchElementLock = (element) ->
  element.lockMovementX = !element.lockMovementX
  element.lockMovementY = !element.lockMovementY 
  element.cornerColor = if element.lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'
  element.borderColor = if element.lockMovementX then 'rgba(150,0,0,0.5)' else 'rgba(102,153,255,0.5)'

switchActiveGroupLock = (canvas) ->
  for activeGroupObject in canvas.getActiveGroup().objects
    @switchElementLock(activeGroupObject)
  canvas.renderAll()

window.PaintMasterPlugin.modules.CanvasElements =
  switchActiveElementLock: switchActiveElementLock
  switchElementLock:       switchElementLock
  switchActiveGroupLock:   switchActiveGroupLock
    
        