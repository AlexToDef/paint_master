window.PaintMasterPlugin.tools.SelectionModeSwitch = class SelectionModeSwitch extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Выделение'
    @id = 'selection-mode'
    super(@paintMaster)

  onClick: =>
    @paintMaster.fCanvas.isDrawingMode = false

  activate: ->
    super()
    @displaySettings ['canvasWidth', 'canvasHeight']

  deactivate: ->
    super()
    @hideSettings ['canvasWidth', 'canvasHeight']
