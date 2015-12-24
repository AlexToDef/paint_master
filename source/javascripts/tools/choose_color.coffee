window.PaintMasterPlugin.tools.ChooseColor = class ChooseColor extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Выбрать цвет'
    @id = 'choose-color'
    super(@paintMaster)
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}' style='color: #{@paintMaster.settings.color}'> </div>"
    @colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#FFFFFF']

  activate: (e) =>
    super()
    @displayPanel()
    paintMaster = @paintMaster
    self = @
    $(@paintMaster.toolboxEl.parent()).on 'click', '.pm-choose-color-item', (e) ->
      paintMaster.selectedColor = $(@).data 'color'
      paintMaster.fCanvas.freeDrawingBrush.color = $(@).data 'color'
      paintMaster.toolboxEl.find('.pm-tool.choose-color').css('color', $(@).data 'color')
      window.localStorage['pmAttr[color]'] = $(@).data 'color'
      self.deactivate()

  deactivate: (e) =>
    super()
    @hidePanel()

  displayPanel: ->
    return $('.pm-block.pm-choose-color').removeClass('hidden') if $('.pm-block.pm-choose-color').length
    html = "
      <div class='pm-block pm-choose-color'>
        #{(@renderColorItem(color) for color in @colors).join('')}
      </div>
    "
    toolboxWrapper = @paintMaster.toolboxEl.parent()
    toolboxWrapper.append html

  renderColorItem: (color) ->
    return "<div class='pm-choose-color-item'><div style='background-color: #{color}' data-color='#{color}'>2</div></div>"

  hidePanel: ->
    $('.pm-block.pm-choose-color').addClass('hidden')