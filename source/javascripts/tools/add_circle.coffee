window.PaintMasterPlugin.tools.AddCircle = class AddCircle extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Add Circle'
    @id = 'add-circle'
    super(@paintMaster)

  onClick: =>
    circle = new fabric.Circle
      top : 100,
      left : 100,
      radius: 100,
      stroke: @currentColor(),
      fill: '',
      strokeWidth: @currentWidth()
    @paintMaster.fCanvas.add(circle);
