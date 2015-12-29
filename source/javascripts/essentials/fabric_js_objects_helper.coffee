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

onPressEscape = (paintMaster) ->
  canvas = paintMaster.canvas
  if canvas.getActiveObject() and paintMaster.activeTool
    e.preventDefault()
    paintMaster.activeTool.onSubmit(e)
  switchActiveElementLock(canvas) if canvas.getActiveObject()
  switchActiveGroupLock() if canvas.getActiveGroup()

onPressEnter = (paintMaster) ->
  paintMaster.canvas.deactivateAll().renderAll()#.remove(activeGroupObject).renderAll()
  paintMaster.activeTool.deactivate() if paintMaster.activeTool

onPressBackspace = (e, paintMaster) ->
  canvas = paintMaster.canvas
  if canvas.getActiveObject() or canvas.getActiveGroup()
    e.preventDefault()
    if paintMaster.activeTool
      paintMaster.activeTool.onBackspace(e)
    else
      activeObject = canvas.getActiveObject()
      canvas.remove activeObject
      if canvas.getActiveGroup()
        for activeGroupObject in canvas.getActiveGroup().objects
          canvas.deactivateAll().remove(activeGroupObject).renderAll()

keydown = {
  27: (event, paintMaster) ->
    onPressEnter(paintMaster)
  13: (event, paintMaster) ->
    onPressEscape(paintMaster)
  46: (event, paintMaster) ->
    onPressBackspace(event, paintMaster)
  8:  (event, paintMaster) ->
    onPressBackspace(event, paintMaster)
}

window.PaintMasterPlugin.modules.FabricJsObjectsHelper =
  switchActiveElementLock: switchActiveElementLock
  switchElementLock:       switchElementLock
  switchActiveGroupLock:   switchActiveGroupLock
  keydown:                 keydown
    
        