window.PaintMasterPlugin.tools.SelectColor = class SelectColor extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'SelectColor'
    @id = 'select-color'
    super(@paintMaster)
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'> <input type='color' class='pm-colorpicker' /> </div>"

  onClick: (e) =>
    1

  onChange: (e) =>
    @paintMaster.selectedColor = e.currentTarget.value
    @paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value
    @paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value)
    
