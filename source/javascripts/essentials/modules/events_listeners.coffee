onPressEnter = (e, paintMaster) ->
  canvas = paintMaster.canvas
  if canvas.getActiveObject() and paintMaster.activeTool
    e.preventDefault()
    paintMaster.activeTool.onSubmit(e)
  switchActiveElementLock(canvas) if canvas.getActiveObject()
  switchActiveGroupLock() if canvas.getActiveGroup()

onPressEscape = (paintMaster) ->
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
    onPressEscape(paintMaster)
  13: (event, paintMaster) ->
    onPressEnter(event, paintMaster)
  46: (event, paintMaster) ->
    onPressBackspace(event, paintMaster)
  8:  (event, paintMaster) ->
    onPressBackspace(event, paintMaster)
}

window.PaintMasterPlugin.modules.EventsListeners =
  keydown: keydown
    
        