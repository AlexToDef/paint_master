window.PaintMasterPlugin.tools.AddText = class AddText extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Текст'
    @help = 'Нажмите на появившееся поле чтобы редактировать текст'
    @id = 'add-text'
    # self = @
    # $(document).on 'pmSettingsChange', (e) ->
    #   if e.originalEvent.detail.property == 'color' and self.iText
    #     self.iText.fill = e.originalEvent.detail.newVal
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