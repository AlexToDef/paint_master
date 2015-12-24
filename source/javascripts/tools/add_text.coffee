window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @help = 'Нажмите на появившееся поле чтобы редактировать текст'
    @id = 'add-text'
    super(@paintMaster)

  activate: ->
    super()
    @displayPalette()
    @setAuxDisplay '.pm-aux__control-font-size', 'block'

  deactivate: ->
    super()
    @setAuxDisplay '.pm-aux__control-font-size', 'none'

  mousedown: (e) =>
    mouse = @canvas.getPointer(e.e)
    if @active
      @iText = new fabric.IText "Текст",
        fontFamily: 'arial black',
        left: mouse.x, 
        top: mouse.y,
        fill: @paintMaster.settings.color
        fontSize: parseInt(@paintMaster.settings.fontSize)
      @fCanvas.add(@iText)
      @canvas.renderAll().setActiveObject(@iText)
      super()
    @deactivate()