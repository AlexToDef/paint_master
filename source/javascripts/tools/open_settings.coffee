window.PaintMasterPlugin.tools.OpenSettings = class OpenSettings extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Open Settings'
    @id = 'open-settings'
    super(@paintMaster)
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'> </div>"

  onClick: (e) =>
    1

  onChange: (e) =>
    @paintMaster.selectedColor = e.currentTarget.value
    @paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value
    @paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value)
    
