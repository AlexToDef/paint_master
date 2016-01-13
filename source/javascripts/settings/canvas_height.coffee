window.PaintMasterPlugin.settings.CanvasHeight = class CanvasHeight extends BaseSetting
  constructor: (@paintMaster) ->
    @attributeName = 'canvasHeight'
    @humanName = 'Высота xолста'
    @initialValue = localStorage['pmAttr[canvasHeight]'] || 500
    @html = @makeHTML()

  included: ->
    super()
    @paintMaster.canvas.setHeight @initialValue

  registerCallbacks: ->
    self = @
    paintMaster = @paintMaster
    $(document).on 'pmSettingsChange', (e) ->
      if e.originalEvent.detail.property == 'canvasHeight'
        value = e.originalEvent.detail.newVal
        paintMaster.canvas.setHeight(value)
        $('.pm-settings__item[data-pm-settings-attr="canvasHeight"] label span').html(value)
        localStorage['pmAttr[canvasHeight]'] = value
        $('.pm-settings__item[data-pm-settings-attr="canvasHeight"] input').val(value)

    $(document).on 'input', '.pm-settings__item[data-pm-settings-attr="canvasHeight"]', (e) ->
      self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber

  makeHTML: ->
    "
    <div class='pm-settings__item' data-pm-settings-attr='canvasHeight'>
      <label> #{@humanName}: </label>
      <input type='number' min='1' max='4000' value='#{@initialValue}'>
    </div>
    "
