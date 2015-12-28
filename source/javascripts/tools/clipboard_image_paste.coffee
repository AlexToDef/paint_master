window.PaintMasterPlugin.tools.ClipboardImagePaste = class ClipboardImagePaste extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Вставить картинку из буфера'
    @help = 'Чтобы вставить картинку из буфера, нажмите <b>CTRL-V</b> </br> <b>Внимание!</b> Размеры холста будут изменены в соответствии с размерами вставленного изображения'
    @id = 'clipboard-image-paste'
    @resize = true
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
        style='width: 1px; height: 1px; overflow: hidden; outline: none;'
      ></div>"
    pasteButtons = if navigator.platform.match(/Mac/) != null
      "<span>&#8984;</span>&nbsp;+&nbsp;<span>V</span>"
    else
      "<span>Ctrl</span>&nbsp;+&nbsp;<span>V</span>"
    if @paintMaster.settings.canvasWidth > 400
      helpHtml = "
        <div class='pm-canvas-overlay'>
          <div class='pm-canvas-overlay__title'>
            <div> Нажмите  
            <div class='important'>#{pasteButtons}</div>
            <div> чтобы вставить картинку </div>
            <div> из буфера </div>
          </div>
        </div>
      "
    else if @paintMaster.settings.canvasWidth > 300
      helpHtml = "<div class='pm-canvas-overlay'>
          <div class='pm-canvas-overlay__title'>
            <div class='important'>#{pasteButtons}</div>
          </div>
        </div>"
    else
      helpHtml = "<div class='pm-canvas-overlay'>
          <div class='pm-canvas-overlay__title'>
            Ctrl&nbsp;&#8212;&nbsp;V
            </br>
            &#8984;&nbsp;&#8212;&nbsp;V
          </div>
        </div>"
    @pasteElem = $(html).appendTo(@paintMaster.containerEl[1])
    @helpElem = $(helpHtml).appendTo($(@paintMaster.containerEl[1]))
    @pasteElem.focus()
    window.addEventListener 'click', @clickEventListener, false
    super()

  deactivate: ->
    super()
    @pasteElem.remove() if @pasteElem
    @helpElem.remove() if @helpElem
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
      @canvas.add(imgInstance)
      @canvas.renderAll()
      @deactivate()
      if @resize
        @paintMaster.settings.canvasHeight = imgInstance.height
        @paintMaster.settings.canvasWidth = imgInstance.width
        @resize = false
    ).bind @
