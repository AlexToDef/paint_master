window.PaintMasterPlugin.tools.ClipboardImagePaste = class ClipboardImagePaste extends window.PaintMasterPlugin.tools.BaseTool
  constructor: (@paintMaster) ->
    @name = 'Вставить картинку из буфера (CTRL-V)'
    @id = 'clipboard-image-paste'
    super(@paintMaster)

  activate: ->
    @setImagePasteListener()
    super()

  setImagePasteListener: ->
    self = @
    pasteImage = (event) ->
      cbData = event.clipboardData
      i = 0
      while i < cbData.items.length
        cbDataItem = cbData.items[i]
        type = cbDataItem.type
        if type.indexOf('image') != -1
          imageData = cbDataItem.getAsFile()
          imageURL = window.webkitURL.createObjectURL(imageData)
          self.onImagePaste(imageURL)
        i++
      return
    window.addEventListener("paste", pasteImage);

  onImagePaste: (imageURL) ->
    return unless @active
    img = new fabric.Image.fromURL(imageURL, ((imgFromURL)->
      @canvas.setBackgroundImage(imgFromURL, (->
        @canvas.setHeight imgFromURL.height
        @canvas.setWidth imgFromURL.width
        @canvas.renderAll()
        @deactivate()
      ).bind(@))
    ).bind(@))

