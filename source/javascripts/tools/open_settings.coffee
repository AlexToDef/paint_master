window.PaintMasterPlugin.SettingsItem = class SettingsItem
  constructor: (@paintMaster, @params) ->
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
    for callback in @params.callbacks
      callback.call(@paintMaster)

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

  getSettingsItems: ->
    return defaultSettingsItems if defaultSettingsItems
    defaultSettingsItems = []
    fontSizeItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Font size',
          cssClass: 'pm-font-size-value',
          pmAttr:   'fontSize',
          htmlInput: "<input type='range' min='1' max='100' class='pm-font-size' value='#{parseInt(@paintMaster.settings.fontSize)}'>",
          callbacks: [
            (->
              self = @
              $(@containerEl).on 'input', '.pm-font-size', (e) ->
                self.settings.fontSize = e.currentTarget.valueAsNumber + 'px'
                $('span.pm-font-size-value').html(self.settings.fontSize) 
            )
          ]
        }
      )
    brushSizeItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Brush size',
          cssClass: 'pm-brush-size-value',
          pmAttr:   'brushSize',
          htmlInput: "<input type='range' min='1' max='100' class='pm-brush-size' value='#{parseInt(@paintMaster.settings.brushSize)}'>",
          callbacks: [
            (->
              self = @
              $(@containerEl).on 'input', '.pm-brush-size', (e) ->
                self.settings.brushSize = e.currentTarget.valueAsNumber + 'px'
                $('span.pm-brush-size-value').html(self.settings.brushSize) 
            )
          ]
        }
      )
    canvasWidthItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Canvas width',
          cssClass: 'pm-canvas-width-value',
          pmAttr:   'canvasWidth',
          htmlInput: "<input type='range' min='1' max='1000' class='pm-canvas-width' value='#{parseInt(@paintMaster.settings.canvasWidth)}'>",
          callbacks: [
            (->
              self = @
              $(@containerEl).on 'input', '.pm-canvas-width', (e) ->
                self.settings.canvasWidth = e.currentTarget.valueAsNumber + 'px'
                $('span.pm-canvas-width-value').html(self.settings.canvasWidth) 
            )
          ]
        }
      )
    canvasHeightItem = new PaintMasterPlugin.SettingsItem(
        @paintMaster,
        {
          label:    'Canvas height',
          cssClass: 'pm-canvas-height-value',
          pmAttr:   'canvasWidth',
          htmlInput: "<input type='range' min='1' max='1000' class='pm-canvas-height' value='#{parseInt(@paintMaster.settings.canvasHeight)}'>",
          callbacks: [
            (->
              self = @
              $(@containerEl).on 'input', '.pm-canvas-height', (e) ->
                self.settings.canvasHeight = e.currentTarget.valueAsNumber + 'px'
                $('span.pm-canvas-height-value').html(self.settings.canvasHeight) 
            )
          ]
        }
      )
    defaultSettingsItems.push fontSizeItem, brushSizeItem, canvasWidthItem, canvasHeightItem
    defaultSettingsItems
      

