window.PaintMasterPlugin.tools.BaseTool = class BaseTool
  constructor: (@paintMaster) ->
    @fCanvas = @paintMaster.fCanvas
    @canvas = @fCanvas
    @html = "<div class='pm-toolbox__tool #{@id}' data-pm-tool-id='#{@id}'></div>"
    @active = false
    @help ||= ''

  onChange: (e) =>
    1

  onClick: (e) ->
    return

  onRemove: ->
    @paintMaster.wrapper.find(".pm-toolbox__tool.#{@id}").remove()

  onMouseover: (e) ->
    tooltipPosition = 'bottom'
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
    if painter.fCanvas.getActiveGroup()
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
    for key, tool of @paintMaster.toolbox
      tool.deactivate() unless tool == @
    $(".pm-toolbox__tool.#{@id}").addClass('pm-toolbox__tool_active')
    @displayHelp()
    @active = true

  deactivate: =>
    $(".pm-toolbox__tool.#{@id}").removeClass('pm-toolbox__tool_active')
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
    return
    @paintMaster.currentToolNameEl.html("#{@name}</br>")
    @paintMaster.currentToolNameEl.after("<span>#{@help}</span>")
    @paintMaster.currentToolEl.removeClass 'hidden'
    @paintMaster.currentToolEl.find('.icon').addClass(@id)

  hideHelp: ->
    return
    @paintMaster.currentToolNameEl.html('')
    @paintMaster.currentToolNameEl.nextAll().remove()
    @paintMaster.currentToolEl.addClass 'hidden'
    @paintMaster.currentToolEl.find('.icon').removeClass(@id)

  unlockDrag: ->
    @canvas.selection = true
    for canvasObj in @canvas._objects
      canvasObj.lockMovementX = false
      canvasObj.lockMovementY = false
      canvasObj.lockScalingX = false
      canvasObj.lockScalingY = false
    @canvas.renderAll()

  lockDrag: ->
    @canvas.selection = false
    for canvasObj in @canvas._objects
      canvasObj.lockMovementX = true
      canvasObj.lockMovementY = true
      canvasObj.lockScalingX = true
      canvasObj.lockScalingY = true
    @canvas.renderAll()

  displaySettings: (settingsName) ->
    for i, name of settingsName
      $("[data-pm-settings-attr='#{name}']").show()

  hideSettings: (settingsName) ->
    for i, name of settingsName
      $("[data-pm-settings-attr='#{name}']").hide()

