class RedmineSave
  constructor: ->
    @iconSrc = 'icons/redo.svg'
    @iconCode = '&#xEA09;'

  apply: (paintable) ->
    dataURL = paintable.canvas[0].toDataURL()
    id = paintable.element.attr('src').match(/\d{1,7}/)[0]
    paintable.element.attr(src: dataURL)
    paintable.dismiss()
    $.ajax(
      method: 'POST'
      url: "/attachments/upload_painted"
      data:
        image_base64: dataURL
        attachment_id: id
    ).done (data) ->
      $(".images [data-id='#{id}'] img").attr('src', $(".images [data-id='#{id}'] img").attr('src') + "?datetime=#{new Date().getTime()}")
      #$(".fancybox-image").attr('src', $(".images [data-id='#{id}'] img").attr('src') + "?datetime=#{new Date().getTime()}")
    
window.PaintMe.Actions.RedmineSave = RedmineSave