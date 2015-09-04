class Dismiss
  constructor: ->
    @iconCode = '&#10006;'

  apply: (paintable) ->
    paintable.dismiss()
        
  remove: ->
    @palette.remove()
    
        
window.PaintMe.Actions.Dismiss = Dismiss