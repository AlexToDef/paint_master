$(document).ready ->
  window.painter = new window.PaintMaster
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 500,
    height: 500,
    position: 'left'

  painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste
  painter.addToolboxItem PaintMasterPlugin.tools.DrawingModeSwitch
  painter.addToolboxItem PaintMasterPlugin.tools.Crop
  painter.addToolboxItem PaintMasterPlugin.tools.AddSquare
  painter.addToolboxItem PaintMasterPlugin.tools.DrawCircle
  painter.addToolboxItem PaintMasterPlugin.tools.AddText
  painter.addToolboxItem PaintMasterPlugin.tools.SelectColor
  painter.addToolboxItem PaintMasterPlugin.tools.OpenSettings