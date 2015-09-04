class BlackAndWhite
  constructor: (paintable) ->
    @paintable = paintable
    
  apply: ->
    @paintable.saveState()
    imgData = @paintable.context.getImageData(0, 0, 600, 700)
    pixels  = imgData.data
    i = 0
    n = pixels.length
    while i < n
      grayscale = pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11
      pixels[i] = grayscale
      pixels[i + 1] = grayscale
      pixels[i + 2] = grayscale
      i += 4
    @paintable.context.putImageData imgData, 0, 0
    
class someEffect
  constructor: (paintable) ->
    @paintable = paintable
    
  apply: ->
    @paintable.saveState()
    imgData = @paintable.context.getImageData(0, 0, 600, 700)
    pixels  = imgData.data
    i = 0
    n = pixels.length
    while i < n
      grayscale = pixels[i] * .1 + pixels[i + 1] * .2 + pixels[i + 2] * .3
      pixels[i] = grayscale
      pixels[i + 1] = grayscale
      pixels[i + 2] = grayscale
      i += 4
    @paintable.context.putImageData imgData, 0, 0

    

class PickEffects
  constructor: ->
    @iconSrc = 'icons/effects.svg'
    @iconCode = '&#xEA03;'

  apply: (paintable) ->
    @availableEffects = 
      blackAndWhite: new BlackAndWhite(paintable)
      someEffect: new someEffect(paintable)
    if (paintable.toolbar.effects)
      $(paintable.toolbar.effects).show()
    else
      tb = paintable.toolbar.element
      effects = $('<div class="at-effects"></div>')
      for own key, value of @availableEffects
        effects.append("<div class='item' data-effect='#{key}'>#{key}</div>")
      $('body').append(effects)
      paintable.toolbar.effects = effects
      $(effects).css 
        position: 'absolute'
        left: tb[0].offsetLeft + tb[0].offsetWidth
        top: tb[0].offsetTop
      self = @    
      $(effects).on 'click', '.item', () ->
        effectName = $(this).data('effect')
        console.log effectName
        effect = self.availableEffects[effectName]
        console.log effect
        effect.apply()
        #$(paintable.toolbar.element).find('.action[data-name="PickEffects"] svg').css('fill', $(this).data('color'))
        #$(effects).hide()
        
#window.PaintMe.Actions.PickEffects = PickEffects