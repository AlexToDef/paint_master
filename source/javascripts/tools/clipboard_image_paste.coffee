window.PaintMasterPlugin.tools.ClipboardImagePaste = class ClipboardImagePaste extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Вставить картинку из буфера'
    @help = 'Чтобы вставить картинку из буфера, нажмите <b>CTRL-V</b> </br> <b>Внимание!</b> Размеры холста будут изменены в соответствии с размерами вставленного изображения'
    @id = 'clipboard-image-paste'
    super(@paintMaster)
    @clickEventListener = (e) ->
      $('#pm-image-paste-field').focus()

  activate: ->
    @x = window.scrollX
    @y = window.scrollY
    window.myPaste = @onPasteEvent
    html = "
      <div
        id='pm-image-paste-field'
        contenteditable='true'
        onpaste='window.myPaste(this, event)'
        style='width: 1px; height: 1px; overflow: hidden;'
      ></div>"
    @pasteElem = $(html).appendTo(@paintMaster.containerEl[1])
    @pasteElem.focus()
    window.addEventListener 'click', @clickEventListener, false
    super()

  deactivate: ->
    super()
    @pasteElem.remove() if @pasteElem
    window.removeEventListener 'click', @clickEventListener, false

  onPasteEvent: (elem, event) =>
    if event.clipboardData and event.clipboardData.items
      @extractImageFromClipboard(event)
    else
      @tryToExtractImageFromContainer()

  tryToExtractImageFromContainer: ->
    pastedImage = @pasteElem.find('img')
    if pastedImage.length
      @onImagePaste(pastedImage.attr('src'))
    else
      setTimeout (->
        @tryToExtractImageFromContainer()
      ).bind(@), 100

  extractImageFromClipboard: (event) ->
    cbData = event.clipboardData
    i = 0
    while i < cbData.items.length
      cbDataItem = cbData.items[i]
      type = cbDataItem.type
      if type.indexOf('image') != -1
        imageData = cbDataItem.getAsFile()
        imageURL = window.URL.createObjectURL(imageData)
        @onImagePaste(imageURL)
      i++
    return 

  onImagePaste: (imageURL) ->
    return unless @active
    image = new Image()
    image.crossOrigin = "anonymous"
    image.src = imageURL
    image.onload = (->
      imgInstance = new fabric.Image(image, {} )
      @paintMaster.settings.canvasHeight = imgInstance.height
      @paintMaster.settings.canvasWidth = imgInstance.width
      @canvas.setBackgroundImage(imgInstance)
      @canvas.renderAll()
      @deactivate()
    ).bind @
