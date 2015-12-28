$(document).ready ->
  window.painter = new window.PaintMaster
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 500,
    height: 500,
    position: 'top'

  painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste
  # painter.addToolboxItem PaintMasterPlugin.tools.ClipboardBackgroundPaste
  painter.addToolboxItem PaintMasterPlugin.tools.DrawingModeSwitch
  painter.addToolboxItem PaintMasterPlugin.tools.Crop
  painter.addToolboxItem PaintMasterPlugin.tools.DrawRect
  painter.addToolboxItem PaintMasterPlugin.tools.DrawEllipse
  painter.addToolboxItem PaintMasterPlugin.tools.AddText
  painter.addToolboxItem PaintMasterPlugin.tools.WidthAndHeightSettings
  painter.addToolboxItem PaintMasterPlugin.tools.DrawArrow
  # painter.addToolboxItem PaintMasterPlugin.tools.OpenSettings
  # painter.addToolboxItem PaintMasterPlugin.tools.ChooseColor