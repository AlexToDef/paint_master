// Generated by CoffeeScript 1.7.1
(function() {
  var BlackAndWhite, PickEffects, someEffect,
    __hasProp = {}.hasOwnProperty;

  BlackAndWhite = (function() {
    function BlackAndWhite(paintable) {
      this.paintable = paintable;
    }

    BlackAndWhite.prototype.apply = function() {
      var grayscale, i, imgData, n, pixels;
      this.paintable.saveState();
      imgData = this.paintable.context.getImageData(0, 0, 600, 700);
      pixels = imgData.data;
      i = 0;
      n = pixels.length;
      while (i < n) {
        grayscale = pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11;
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
        i += 4;
      }
      return this.paintable.context.putImageData(imgData, 0, 0);
    };

    return BlackAndWhite;

  })();

  someEffect = (function() {
    function someEffect(paintable) {
      this.paintable = paintable;
    }

    someEffect.prototype.apply = function() {
      var grayscale, i, imgData, n, pixels;
      this.paintable.saveState();
      imgData = this.paintable.context.getImageData(0, 0, 600, 700);
      pixels = imgData.data;
      i = 0;
      n = pixels.length;
      while (i < n) {
        grayscale = pixels[i] * .1 + pixels[i + 1] * .2 + pixels[i + 2] * .3;
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
        i += 4;
      }
      return this.paintable.context.putImageData(imgData, 0, 0);
    };

    return someEffect;

  })();

  PickEffects = (function() {
    function PickEffects() {
      this.iconSrc = 'icons/effects.svg';
      this.iconCode = '&#xEA03;';
    }

    PickEffects.prototype.apply = function(paintable) {
      var effects, key, self, tb, value, _ref;
      this.availableEffects = {
        blackAndWhite: new BlackAndWhite(paintable),
        someEffect: new someEffect(paintable)
      };
      if (paintable.toolbar.effects) {
        return $(paintable.toolbar.effects).show();
      } else {
        tb = paintable.toolbar.element;
        effects = $('<div class="at-effects"></div>');
        _ref = this.availableEffects;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          value = _ref[key];
          effects.append("<div class='item' data-effect='" + key + "'>" + key + "</div>");
        }
        $('body').append(effects);
        paintable.toolbar.effects = effects;
        $(effects).css({
          position: 'absolute',
          left: tb[0].offsetLeft + tb[0].offsetWidth,
          top: tb[0].offsetTop
        });
        self = this;
        return $(effects).on('click', '.item', function() {
          var effect, effectName;
          effectName = $(this).data('effect');
          console.log(effectName);
          effect = self.availableEffects[effectName];
          console.log(effect);
          return effect.apply();
        });
      }
    };

    return PickEffects;

  })();

}).call(this);
