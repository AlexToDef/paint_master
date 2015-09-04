$(document).ready ->
  window.painter = new window.PaintMaster
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 100,
    height: 100,
    position: 'top'

  painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste
  painter.addToolboxItem PaintMasterPlugin.tools.DrawingModeSwitch
  painter.addToolboxItem PaintMasterPlugin.tools.Crop
  painter.addToolboxItem PaintMasterPlugin.tools.AddSquare
  painter.addToolboxItem PaintMasterPlugin.tools.DrawCircle
  painter.addToolboxItem PaintMasterPlugin.tools.AddText
  painter.addToolboxItem PaintMasterPlugin.tools.SelectColor
  painter.addToolboxItem PaintMasterPlugin.tools.OpenSettings