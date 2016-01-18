
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

  painter.addToolboxItem PaintMasterPlugin.tools.ClipboardImagePaste, 'hidden'

  painter.addSettingsItem 'Color', 'top'
  painter.addSettingsItem 'CanvasWidth', 'top'
  painter.addSettingsItem 'CanvasHeight', 'top'
  painter.addSettingsItem 'BrushSize', 'top'
  painter.addSettingsItem 'FontSize', 'top'