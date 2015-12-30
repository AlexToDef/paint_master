window.PaintMasterPlugin.settings.BrushSize = class BrushSize extends BaseSetting
  constructor: (@paintMaster) ->
    @attributeName = 'brushSize'
    @humanName = 'Размер кисти'
    @minVal = 1
    @maxVal = 64
    @initialValue = 8
    @html = @makeHTML()
  
  included: ->
    super()
    @paintMaster.canvas.freeDrawingBrush.width = @initialValue

  registerCallbacks: ->
    self = @
    paintMaster = @paintMaster
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'brushSize'
        value = e.originalEvent.detail.newVal
        paintMaster.canvas.freeDrawingBrush.width = (value)
        $('.pm-settings__item[data-pm-settings-attr="brushSize"] label span').html(value)
        $('.pm-settings__item[data-pm-settings-attr="brushSize"] input').html(value)
        localStorage['pmAttr[brushSize]'] = value

    $(document).on 'input', '.pm-settings__item[data-pm-settings-attr="brushSize"] input', (e) ->
      console.log 23
      self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber
