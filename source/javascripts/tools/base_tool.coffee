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
    console.log 'onRemove'
    @paintMaster.wrapperEl.find(".pm-tool.#{@id}").remove()

  currentColor: =>
    @paintMaster.selectedColor || 'red'

  currentWidth: =>
    @paintMaster.selectedWidth || 5

  activate: =>
    tool.deactivate() for key, tool of @paintMaster.toolbox
    $(".pm-tool.#{@id}").addClass('active')
    @active = true

  deactivate: =>
    $(".pm-tool.#{@id}").removeClass('active')
    @active = false

  mousedown: (e) ->
    return

  mousemove: (e) ->
    return

  mouseup: (e) ->
    return
