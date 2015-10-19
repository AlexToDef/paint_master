window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @help = 'Нажмите на появившееся поле чтобы редактировать текст'
    @id = 'add-text'
    super(@paintMaster)

  activate: =>
    @iText = new fabric.IText "Текст",
      fontFamily: 'arial black',
      left: 100, 
      top: 100,
      fill: @currentColor()
      fontSize: parseInt(@paintMaster.settings.fontSize)
    @fCanvas.add(@iText)
    super()