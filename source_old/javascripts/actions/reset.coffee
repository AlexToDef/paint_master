class Reset
  constructor: ->
    @iconCode = '&#xEA08;'
    @iconSrc = 'icons/reset.svg'

  apply: (paintable) ->
    paintable.reset()
    
window.PaintMe.Actions.Reset = Reset