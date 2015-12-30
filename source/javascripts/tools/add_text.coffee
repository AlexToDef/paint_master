window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @help = 'Нажмите на появившееся поле чтобы редактировать текст'
    @id = 'add-text'
    super(@paintMaster)

  activate: ->
    super()

  deactivate: ->
    super()

  mousedown: (e) =>
    mouse = @canvas.getPointer(e.e)
    if @active
      @iText = new fabric.IText '',
        fontFamily: 'arial black',
        left: mouse.x, 
        top: mouse.y,
        fill: @paintMaster.settings.color
        fontSize: parseInt(@paintMaster.settings.fontSize)
      @fCanvas.add(@iText)
      @canvas.renderAll().setActiveObject(@iText)
      @canvas.getActiveObject().trigger('dblclick')
      @iText.enterEditing()
      super()
    @deactivate()