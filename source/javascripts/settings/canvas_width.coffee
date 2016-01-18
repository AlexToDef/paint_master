window.PaintMasterPlugin.settings.CanvasWidth = class CanvasWidth extends BaseSetting
  constructor: (@paintMaster) ->
    @attributeName = 'canvasWidth'
    @humanName = 'Ширина xолста'
    @initialValue = localStorage['pmAttr[canvasWidth]']  || 1000
    @html = @makeHTML()

  included: ->
    super()
    @paintMaster.canvas.setWidth @initialValue

  registerCallbacks: ->
    self = @
    paintMaster = @paintMaster
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'canvasWidth'
        value = e.originalEvent.detail.newVal
        paintMaster.canvas.setWidth(value)
        $('.pm-settings__item[data-pm-settings-attr="canvasWidth"] label span').html(parseInt(value))
        localStorage['pmAttr[canvasWidth]'] = value
        $('.pm-settings__item[data-pm-settings-attr="canvasWidth"] input').val(parseInt(value))

    $(document).on 'input', '.pm-settings__item[data-pm-settings-attr="canvasWidth"]', (e) ->
      self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber

  makeHTML: ->
    "
    <div class='pm-settings__item' data-pm-settings-attr='canvasWidth'>
      <label> Ширина холста: </label>
      <input type='number' min='1' max='4000' value='#{@initialValue}'>
    </div>
    "
