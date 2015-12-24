window.PaintMasterPlugin.tools.WidthAndHeightSettings = class WidthAndHeightSettings extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Высота и ширина холста'
    @id = 'open-settings'
    @active = false
    @canvas = @paintMaster.fCanvas
    super(@paintMaster)

  activate: ->
    super()
    @lockDrag()
    @setAuxDisplay '.pm-aux__control-canvas-width', 'block'
    @setAuxDisplay '.pm-aux__control-canvas-height', 'block'

  deactivate: ->
    super()
    @unlockDrag()
    @hidePalette()
    @setAuxDisplay '.pm-aux__control-canvas-width', 'none'
    @setAuxDisplay '.pm-aux__control-canvas-height', 'none'
