window.PaintMasterPlugin.tools.BaseTool = class BaseTool
  constructor: (@paintMaster) ->
    @fCanvas = @paintMaster.fCanvas
    @canvas = @fCanvas
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'></div>"
    @active = false
    @help ||= ''

  onChange: (e) =>
    1

  onClick: (e) ->
    return

  onRemove: ->
    @paintMaster.wrapperEl.find("pm-tool.#{@id}").remove()

  onMouseover: (e) ->
    tooltipPosition = 'top'
    targetEl = $(e.currentTarget)
    targetEl.append("<div class='pm-tooltip pm-tooltip-#{tooltipPosition}'>#{@name}</div>") unless targetEl.find('.pm-tooltip').length > 0

  onMouseleave: (e) ->
    targetEl = $(e.currentTarget)
    targetEl.find('.pm-tooltip').remove()

  onSubmit: (e) ->
    return

  onBackspace: (e) ->
    activeObject = @canvas.getActiveObject()
    @canvas.remove activeObject
    for activeGroupObject in painter.fCanvas.getActiveGroup()
      @canvas.remove activeGroupObject

  onSettingsChange: (settingName, oladVal, newVal) ->
    return

  currentColor: =>
    @paintMaster.selectedColor || 'red'

  currentWidth: =>
    parseInt(@paintMaster.settings.brushSize) || 5

  currentFontSize: =>
    parseInt(@paintMaster.settings.fontSize) || 14

  activate: =>
    tool.deactivate() for key, tool of @paintMaster.toolbox
    $(".pm-tool.#{@id}").addClass('active')
    @displayHelp()
    @active = true

  deactivate: =>
    $(".pm-tool.#{@id}").removeClass('active')
    @hideHelp()
    @paintMaster.activeTool = null
    @active = false

  mousedown: (e) ->
    return

  mousemove: (e) ->
    return

  mouseup: (e) ->
    return

  displayHelp: ->
    @paintMaster.currentToolNameEl.html("#{@name}</br>")
    @paintMaster.currentToolNameEl.after("<span>#{@help}</span>")
    @paintMaster.currentToolEl.removeClass 'hidden'
    @paintMaster.currentToolEl.find('.icon').addClass(@id)

  hideHelp: ->
    @paintMaster.currentToolNameEl.html('')
    @paintMaster.currentToolNameEl.nextAll().remove()
    @paintMaster.currentToolEl.addClass 'hidden'
    @paintMaster.currentToolEl.find('.icon').removeClass(@id)

