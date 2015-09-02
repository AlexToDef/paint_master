window.PaintMasterPlugin.tools.DrawingModeSwitch = class DrawingModeSwitch extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Drawing Mode Switch'
    @id = 'dr-mode-switch'
    super(@paintMaster)

  onClick: =>
    @paintMaster.fCanvas.isDrawingMode = @active

  activate: ->
    super()
    @paintMaster.fCanvas.isDrawingMode = @active

  deactivate: ->
    super()
    @paintMaster.fCanvas.isDrawingMode = @active
