window.PaintMasterPlugin.settings.BaseSetting = class BaseSetting
  constructor: (@paintMaster) ->
    @html = makeHTML()
    @minVal = 1
    @maxVal = 1000
  
  included: ->
    @paintMaster.settings[@attributeName] = @initialValue

  registerCallbacks: ->
    return

  makeHTML: ->
    "
    <div class='pm-settings__item' data-pm-settings-attr='#{@attributeName}'>
      <label> #{@humanName}: <span>#{@initialValue}</span> </label>
      <input type='range' min='#{@minVal}' max='#{@maxVal}' value='#{@initialValue}'>
    </div>
    "
