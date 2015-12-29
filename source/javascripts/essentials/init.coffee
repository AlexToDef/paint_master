$(document).ready ->
  window.painter = new window.PaintMaster
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 500,
    height: 500,
    position: 'top'

  painter.addToolboxItem PaintMasterPlugin.tools.SelectionModeSwitch, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.Crop, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.DrawRect, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.DrawEllipse, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.DrawingModeSwitch, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.DrawArrow, 'top'
  painter.addToolboxItem PaintMasterPlugin.tools.AddText, 'top'

  painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste, 'top'
  # painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste
  # painter.addToolboxItem PaintMasterPlugin.tools.ClipboardBackgroundPaste
  # painter.addToolboxItem PaintMasterPlugin.tools.WidthAndHeightSettings
  # painter.addToolboxItem PaintMasterPlugin.tools.OpenSettings
  # painter.addToolboxItem PaintMasterPlugin.tools.ChooseColor