window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @id = 'add-text'
    super(@paintMaster)

  onClick: =>
    @iText = new fabric.IText "Tap and type",
      fontFamily: 'arial black',
      left: 100, 
      top: 100,
      fill: @currentColor()
    @paintMaster.fCanvas.add(@iText);

  onBackspace: (e) ->
    return if @canvas.getActiveObject() == @iText
    super()

  activate: =>
    return

  deactivate: =>
    return