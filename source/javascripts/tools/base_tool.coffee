window.PaintMasterPlugin.tools.BaseTool = class BaseTool
  constructor: (@paintMaster) ->
    @fCanvas = @paintMaster.fCanvas
    @canvas = @fCanvas
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'></div>"
    @active = false

  onChange: (e) =>
    1

  onClick: (e) ->
    return

  onRemove: ->
    @paintMaster.wrapperEl.find("pm-tool.#{@id}").remove()

  onMouseover: (e) ->
    targetEl = $(e.currentTarget)
    targetEl.append("<div class='pm-tooltip'>#{@name}</div>") unless targetEl.find('.pm-tooltip').length > 0

  onMouseleave: (e) ->
    targetEl = $(e.currentTarget)
    targetEl.find('.pm-tooltip').remove()

  onSubmit: (e) ->
    return

  onBackspace: (e) ->
    activeObject = @canvas.getActiveObject()
    @canvas.remove activeObject

  currentColor: =>
    @paintMaster.selectedColor || 'red'

  currentWidth: =>
    @paintMaster.selectedWidth || 5

  activate: =>
    tool.deactivate() for key, tool of @paintMaster.toolbox
    $(".pm-tool.#{@id}").addClass('active')
    @paintMaster.currentToolNameEl.html(@name)
    @active = true

  deactivate: =>
    $(".pm-tool.#{@id}").removeClass('active')
    @paintMaster.currentToolNameEl.html('')
    @paintMaster.activeTool = null
    @active = false

  mousedown: (e) ->
    return

  mousemove: (e) ->
    return

  mouseup: (e) ->
    return
