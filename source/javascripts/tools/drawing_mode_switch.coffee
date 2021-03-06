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
    @displaySettings ['color', 'brushSize']

  deactivate: ->
    super()
    @paintMaster.fCanvas.isDrawingMode = @active
    @hideSettings ['color', 'brushSize']
