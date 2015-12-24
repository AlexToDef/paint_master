window.PaintMasterPlugin.tools.DrawingModeSwitch = class DrawingModeSwitch extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Карандаш'
    @id = 'dr-mode-switch'
    super(@paintMaster)

  onClick: =>
    @paintMaster.fCanvas.isDrawingMode = @active

  activate: ->
    super()
    @paintMaster.fCanvas.isDrawingMode = @active
    @displayPalette()
    @setAuxDisplay '.pm-aux__control-brush-size', 'block'

  deactivate: ->
    super()
    @paintMaster.fCanvas.isDrawingMode = @active
    @hidePalette()
    @setAuxDisplay '.pm-aux__control-brush-size', 'none'
