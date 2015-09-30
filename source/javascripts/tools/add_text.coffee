window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @help = '123 Нажмите на появившееся поле чтобы редактировать текст'
    @id = 'add-text'
    super(@paintMaster)

  # onClick: =>
  #   @iText = new fabric.IText "Tap and type",
  #     fontFamily: 'arial black',
  #     left: 100, 
  #     top: 100,
  #     fill: @currentColor()
  #   @paintMaster.fCanvas.add(@iText);

  activate: =>
    @iText = new fabric.IText "Tap and type",
      fontFamily: 'arial black',
      left: 100, 
      top: 100,
      fill: @currentColor()
      fontSize: parseInt(@paintMaster.settings.fontSize)
    @fCanvas.add(@iText)
    super()