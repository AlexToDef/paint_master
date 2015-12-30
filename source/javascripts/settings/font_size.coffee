window.PaintMasterPlugin.settings.FontSize = class FontSize extends BaseSetting
  constructor: (@paintMaster) ->
    @attributeName = 'fontSize'
    @humanName = 'Размер шрифта'
    @minVal = 1
    @maxVal = 64
    @initialValue = 14
    @html = @makeHTML()
  
  included: ->
    super()
    @paintMaster.canvas.freeDrawingBrush.width = @initialValue

  registerCallbacks: ->
    self = @
    paintMaster = @paintMaster
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'fontSize'
        value = e.originalEvent.detail.newVal
        $('.pm-settings__item[data-pm-settings-attr="fontSize"] label span').html(value)
        $('.pm-settings__item[data-pm-settings-attr="fontSize"] input').html(value)
        localStorage['pmAttr[fontSize]'] = value

    $(document).on 'input', '.pm-settings__item[data-pm-settings-attr="fontSize"] input', (e) ->
      self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber
