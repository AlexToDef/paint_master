class Redo
  constructor: ->
    @iconCode = '&#xEA07;'
    @iconSrc = 'icons/redo.svg'

  apply: (paintable) ->
    paintable.redo()
    
window.PaintMe.Actions.Redo = Redo