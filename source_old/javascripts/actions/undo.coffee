class Undo
  constructor: ->
    @iconCode = '&#xEA0A;'
    @iconSrc = 'icons/undo.svg'

  apply: (paintable) ->
    paintable.undo()
    
window.PaintMe.Actions.Undo = Undo