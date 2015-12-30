window.PaintMasterPlugin.settings.Color = class Color extends BaseSetting
  constructor: (@paintMaster) ->
    @attributeName = 'color'
    @initialValue = localStorage['pmAttr[color]'] || '#ff421f'
    @colors = ['#ff421f', '#00e535', '#000000', '#ff4f81', '#fff24d', '#0096e7', '#919191', '#ffffff']
    @html = @makeHTML()

  included: ->
    super()
    @paintMaster.canvas.freeDrawingBrush.color = @initialValue 

  registerCallbacks: ->
    self = @
    paintMaster = @paintMaster
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'color'
        color = e.originalEvent.detail.newVal
        paintMaster.canvas.freeDrawingBrush.color = color    
        localStorage['pmAttr[color]'] = color
        $(paintMaster.wrapper).find(".pm-settings__palette-item").removeClass('pm-settings__palette-item--active')
        $(paintMaster.wrapper).find("[data-color='#{color}']").parent().addClass('pm-settings__palette-item--active')

    $(paintMaster.wrapper).on 'click', '.pm-settings__palette .pm-settings__palette-item', (e) ->
      self.paintMaster.settings[self.attributeName] = $(e.currentTarget).find('div').data('color')

  makeHTML: ->
    "<div class='pm-settings__palette' data-pm-settings-attr='#{@attributeName}'> #{(@renderColorItem(color) for color in @colors).join('')} </div>"

  renderColorItem: (color) ->
    "<div class='pm-settings__palette-item #{if @initialValue == color then 'pm-settings__palette-item--active' else ''}'> <div style='background-color: #{color}' data-color='#{color}'> </div> </div>"
