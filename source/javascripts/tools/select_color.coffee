window.PaintMasterPlugin.tools.SelectColor = class SelectColor extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Выбор цвета'
    @id = 'select-color'
    super(@paintMaster)
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'> <input type='color' class='pm-colorpicker' /> </div>"

  activate: ->
    tool.deactivate() for key, tool of @paintMaster.toolbox
    
  onChange: (e) =>
    @paintMaster.selectedColor = e.currentTarget.value
    @paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value
    @paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value)
    
