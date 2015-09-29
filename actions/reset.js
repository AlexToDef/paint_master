// Generated by CoffeeScript 1.7.1
(function() {
  var Reset;

  Reset = (function() {
    function Reset() {
      this.iconCode = '&#xEA08;';
      this.iconSrc = 'icons/reset.svg';
    }

    Reset.prototype.apply = function(paintable) {
      return paintable.reset();
    };

    return Reset;

  })();

  window.PaintMe.Actions.Reset = Reset;

}).call(this);