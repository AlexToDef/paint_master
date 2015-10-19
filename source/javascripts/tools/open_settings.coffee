window.PaintMasterPlugin.SettingsItem = class SettingsItem
  constructor: (@paintMaster, @params) ->
    @pmProperty = @params.pmAttr
    @callbacks = @params.callbacks
    @eventListeners = [
      (paintMaster, settingItemParams) ->
        document.addEventListener 'pmSettingsChange', ((e) ->
          $(".#{settingItemParams.cssClass}").html(paintMaster.settings[e.detail.property]) if e.detail.property == @pmProperty
      ).bind @
    ]

    return

  render: ->
    "
      <div class='pm-settings-element'>
        <label>
          #{@params.label}:
        </label>
        <span class='pm-settings-value #{@params.cssClass}'>
          #{@paintMaster.settings[@params.pmAttr]}
        </span>
        <span class='pm-settings-input-container'>
          #{@params.htmlInput}
        </span>
      </div>
    "

  setCallbacks: ->
    return unless @callbacks?
    for callback in @callbacks
      callback.call @, @paintMaster

  setEventsListeners: ->
    return unless @eventListeners?
    for eventListener in @eventListeners
      eventListener.call @, @paintMaster, @params

window.PaintMasterPlugin.tools.OpenSettings = class OpenSettings extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Настройки'
    @id = 'open-settings'
    super(@paintMaster)
    @html = "<div class='pm-tool #{@id}' data-pm-tool-id='#{@id}'> </div>"

  activate: (e) =>
    super()
    @displaySettingsPanel()
    @setSettingsCallbacks()
    @setSettingsEventListeners()

  deactivate: (e) =>
    super()
    @hideSettingsPanel()

  onChange: (e) =>
    @paintMaster.selectedColor = e.currentTarget.value
    @paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value
    @paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value)

  onSettingsChange: (settingName, oladVal, newVal) ->
    return

  displaySettingsPanel: ->
    return $('.pm-block.pm-settings').removeClass('hidden') if $('.pm-block.pm-settings').length
    html = "
      <div class='pm-block pm-settings'>
        #{ (settingItem.render() for settingItem in @getSettingsItems()).join('') }
      </div>
    "
    toolboxWrapper = @paintMaster.toolboxEl.parent()
    toolboxWrapper.append html

  hideSettingsPanel: ->
    $('.pm-block.pm-settings').addClass('hidden')  

  setSettingsCallbacks: ->
    settingItem.setCallbacks() for settingItem in @getSettingsItems()

  setSettingsEventListeners: ->
    settingItem.setEventsListeners() for settingItem in @getSettingsItems()

  getSettingsItems: ->
    return defaultSettingsItems if defaultSettingsItems
    defaultSettingsItems = []
    fontSizeItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Размер шрифта',
          cssClass: 'pm-font-size-value',
          pmAttr:   'fontSize',
          htmlInput: "<input type='range' min='1' max='100' class='pm-font-size' value='#{parseInt(@paintMaster.settings.fontSize)}'>",
          callbacks: [
            ( (paintMaster) ->
              $(paintMaster.containerEl).on 'input', '.pm-font-size', ((e) ->
                @settings.fontSize = e.currentTarget.valueAsNumber
              ).bind paintMaster
            )
          ]
        }
      )
    brushSizeItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Размер кисти',
          cssClass: 'pm-brush-size-value',
          pmAttr:   'brushSize',
          htmlInput: "<input type='range' min='1' max='100' class='pm-brush-size' value='#{parseInt(@paintMaster.settings.brushSize)}'>",
          callbacks: [
            ( (paintMaster) ->
              $(paintMaster.containerEl).on 'input', '.pm-brush-size', ((e) ->
                @settings.brushSize = e.currentTarget.valueAsNumber
              ).bind paintMaster
            )
          ]
        }
      )
    canvasWidthItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Ширина холста',
          cssClass: 'pm-canvas-width-value',
          pmAttr:   'canvasWidth',
          htmlInput: "<input type='range' min='32' max='4096' class='pm-canvas-width' value='#{parseInt(@paintMaster.settings.canvasWidth)}'>",
          callbacks: [
            ( (paintMaster) ->
              $(paintMaster.containerEl).on 'input', '.pm-canvas-width', ((e) ->
                @settings.canvasWidth = e.currentTarget.valueAsNumber
              ).bind paintMaster
            )
          ]
        }
      )
    canvasHeightItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Высота холста',
          cssClass: 'pm-canvas-height-value',
          pmAttr:   'canvasHeight',
          htmlInput: "<input type='range' min='32' max='4096' class='pm-canvas-height' value='#{parseInt(@paintMaster.settings.canvasHeight)}'>",
          callbacks: [
            ( (paintMaster) ->
              $(paintMaster.containerEl).on 'input', '.pm-canvas-height', ((e) ->
                @settings.canvasHeight = e.currentTarget.valueAsNumber
              ).bind paintMaster
            )
          ]
        }
      )
    defaultSettingsItems.push fontSizeItem, brushSizeItem, canvasWidthItem, canvasHeightItem
    defaultSettingsItems
      

