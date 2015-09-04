// Generated by CoffeeScript 1.7.1
(function() {
  var RedmineSave;

  RedmineSave = (function() {
    function RedmineSave() {
      this.iconSrc = 'icons/redo.svg';
      this.iconCode = '&#xEA09;';
    }

    RedmineSave.prototype.apply = function(paintable) {
      var dataURL, id;
      dataURL = paintable.canvas[0].toDataURL();
      id = paintable.element.attr('src').match(/\d{1,7}/)[0];
      paintable.element.attr({
        src: dataURL
      });
      paintable.dismiss();
      return $.ajax({
        method: 'POST',
        url: "/attachments/upload_painted",
        data: {
          image_base64: dataURL,
          attachment_id: id
        }
      }).done(function(data) {
        return $(".images [data-id='" + id + "'] img").attr('src', $(".images [data-id='" + id + "'] img").attr('src') + ("?datetime=" + (new Date().getTime())));
      });
    };

    return RedmineSave;

  })();

  window.PaintMe.Actions.RedmineSave = RedmineSave;

}).call(this);
