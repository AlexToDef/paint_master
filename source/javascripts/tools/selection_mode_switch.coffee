window.PaintMasterPlugin.tools.SelectionModeSwitch = class SelectionModeSwitch extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Выделение'
    @id = 'selection-mode'
    super(@paintMaster)

  onClick: =>
    @paintMaster.fCanvas.isDrawingMode = false

  activate: ->
    super()
    @setAuxDisplay '.pm-aux__control-canvas-width', 'block'
    @setAuxDisplay '.pm-aux__control-canvas-height', 'block'

  deactivate: ->
    super()
    @hidePalette()
    @setAuxDisplay '.pm-aux__control-canvas-width', 'none'
    @setAuxDisplay '.pm-aux__control-canvas-height', 'none'
