window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Add Text'
    @id = 'add-text'
    super(@paintMaster)

  onClick: =>
    rect = new fabric.IText "Tap and type",
      fontFamily: 'arial black',
      left: 100, 
      top: 100,
      fill: @currentColor()
    @paintMaster.fCanvas.add(rect);

