var AddText, BaseTool, ChooseColor, ClipboardBackgroundPaste, ClipboardImagePaste, Crop, DrawArrow, DrawEllipse, DrawRect, DrawingModeSwitch, OpenSettings, PaintMaster, SelectColor, SettingsItem, WidthAndHeightSettings, strSVG,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

window.PaintMasterPlugin = {};

window.PaintMasterPlugin.tools = {};

window.PaintMasterPlugin.PaintMaster = PaintMaster = (function() {
  function PaintMaster(opts) {
    this.opts = opts;
    this.toolbox = {};
    this.settings = {
      canvasWidth: localStorage['pmAttr[canvasWidth]'] || this.opts.width,
      canvasHeight: localStorage['pmAttr[canvasHeight]'] || this.opts.height,
      fontSize: localStorage['pmAttr[fontSize]'] || 16,
      brushSize: localStorage['pmAttr[brushSize]'] || 5,
      color: localStorage['pmAttr[color]'] || '#ff421f'
    };
    this.fCanvas = new fabric.Canvas(this.opts.id);
    this.fCanvas.freeDrawingBrush.color = this.settings.color;
    this.fCanvas.freeDrawingBrush.width = this.settings.brushSize;
    this.wrapperEl = $(this.fCanvas.wrapperEl);
    this.drawToolbox();
    this.drawAdditionalToolbox();
    this.drawPalette();
    this.drawBrushSizeControl();
    this.drawCanvasWidthControl();
    this.drawCanvasHeightControl();
    this.drawFontSizeControl();
    this.setToolboxEventListeners();
    this.setDrawListeners();
    this.setAttributeListeners();
    this.fCanvas.setWidth(this.settings.canvasWidth);
    this.fCanvas.setHeight(this.settings.canvasHeight);
    this.fCanvas.setBackgroundColor('white');
    this.fCanvas.renderAll();
  }

  PaintMaster.prototype.drawToolbox = function() {
    var html;
    html = "<div class='pm-toolbox-wrapper pm-toolbox-" + this.opts.position + "'> <div class='pm-toolbox'></div> <div class='pm-palette'></div> <div class='pm-aux'></div> <div class='pm-block pm-current-tool hidden'> <div class='icon'> </div> <div class='desc'> <span class='pm-current-tool-name'></span> </div> <div style='clear: both'></div> </div> </div>";
    if (this.opts.position === 'top' || this.opts.position === 'left') {
      this.toolboxEl = $(html).insertBefore(this.wrapperEl).find('.pm-toolbox');
    } else if (this.opts.position === 'right') {
      this.toolboxEl = $(html).insertAfter(this.wrapperEl).find('.pm-toolbox');
    }
    this.currentToolNameEl = $(this.toolboxEl).parent().find('.pm-current-tool-name');
    this.currentToolEl = $(this.toolboxEl).parent().find('.pm-current-tool');
    this.containerEl = $('.pm-toolbox-wrapper, .canvas-container').wrapAll("<div class='pm-main-container pm-main-container-" + this.opts.position + "'></div>");
    this.paletteEl = this.toolboxEl.parent().find('.pm-palette');
    return this.auxEl = this.toolboxEl.parent().find('.pm-aux');
  };

  PaintMaster.prototype.drawAdditionalToolbox = function() {
    var html;
    return html = "<div class='pm-additional-toolbox'></div>";
  };

  PaintMaster.prototype.setToolboxEventListeners = function() {
    var onKeyDownHandler, self;
    self = this;
    $(this.containerEl).on('click', '.pm-toolbox .pm-tool', function(e) {
      var key, ref, tool, toolId;
      toolId = $(this).data('pmToolId');
      self.toolbox[toolId].onClick(e);
      if (self.activeTool === self.toolbox[toolId]) {
        ref = self.toolbox;
        for (key in ref) {
          tool = ref[key];
          tool.deactivate();
        }
        return self.activeTool = null;
      } else {
        self.toolbox[toolId].activate();
        return self.activeTool = self.toolbox[toolId];
      }
    });
    $(this.containerEl).on('change', 'input', function(e) {
      var toolId;
      toolId = $(this).parent().data('pmToolId');
      if (toolId) {
        return self.toolbox[toolId].onChange(e);
      }
    });
    $(this.containerEl).on('mouseover', '.pm-tool', function(e) {
      var toolId;
      toolId = $(this).data('pmToolId');
      return self.toolbox[toolId].onMouseover(e);
    });
    $(this.containerEl).on('mouseleave', '.pm-tool', function(e) {
      var toolId;
      toolId = $(this).data('pmToolId');
      return self.toolbox[toolId].onMouseleave(e);
    });
    onKeyDownHandler = function(e) {
      var activeGroupObject, activeObject, j, k, len, len1, ref, ref1, results;
      console.log(e.keyCode);
      switch (e.keyCode) {
        case 46:
        case 8:
          if (self.fCanvas.getActiveObject() || self.fCanvas.getActiveGroup()) {
            e.preventDefault();
            if (self.activeTool) {
              return self.activeTool.onBackspace(e);
            } else {
              activeObject = self.fCanvas.getActiveObject();
              self.fCanvas.remove(activeObject);
              if (self.fCanvas.getActiveGroup()) {
                ref = self.fCanvas.getActiveGroup().objects;
                results = [];
                for (j = 0, len = ref.length; j < len; j++) {
                  activeGroupObject = ref[j];
                  results.push(self.fCanvas.deactivateAll().remove(activeGroupObject).renderAll());
                }
                return results;
              }
            }
          }
          break;
        case 13:
          if (self.fCanvas.getActiveObject() && self.activeTool) {
            e.preventDefault();
            self.activeTool.onSubmit(e);
          }
          if (self.fCanvas.getActiveObject()) {
            self.fCanvas.getActiveObject().lockMovementX = !self.fCanvas.getActiveObject().lockMovementX;
            self.fCanvas.getActiveObject().lockMovementY = !self.fCanvas.getActiveObject().lockMovementY;
            self.fCanvas.getActiveObject().cornerColor = self.fCanvas.getActiveObject().lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
            self.fCanvas.getActiveObject().borderColor = self.fCanvas.getActiveObject().lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
            self.fCanvas.renderAll();
          }
          if (self.fCanvas.getActiveGroup()) {
            ref1 = self.fCanvas.getActiveGroup().objects;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              activeGroupObject = ref1[k];
              activeGroupObject.lockMovementX = true;
              activeGroupObject.lockMovementY = true;
              activeGroupObject.cornerColor = activeGroupObject.lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
              activeGroupObject.borderColor = activeGroupObject.lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
            }
            return self.fCanvas.renderAll();
          }
          break;
        case 27:
          self.fCanvas.deactivateAll().remove(activeGroupObject).renderAll();
          if (self.activeTool) {
            return self.activeTool.deactivate();
          }
      }
    };
    return window.onkeydown = onKeyDownHandler;
  };

  PaintMaster.prototype.setDrawListeners = function() {
    this.fCanvas.observe('mouse:down', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mousedown(e);
        }
      };
    })(this));
    this.fCanvas.observe('mouse:move', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mousemove(e);
        }
      };
    })(this));
    return this.fCanvas.observe('mouse:up', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mouseup(e);
        }
      };
    })(this));
  };

  PaintMaster.prototype.addToolboxItem = function(item) {
    item = new item(this);
    this.toolboxEl.append(item.html);
    return this.toolbox[item.id] = item;
  };

  PaintMaster.prototype.removeToolboxItem = function(itemId) {
    this.toolbox[itemId].onRemove();
    return delete this.toolbox[itemId];
  };

  PaintMaster.prototype.exportImage = function(format) {
    var img;
    this.fCanvas.deactivateAll().renderAll();
    img = this.fCanvas.toDataURL({
      format: format,
      left: 0,
      top: 0,
      width: this.fCanvas.width,
      height: this.fCanvas.height
    });
    return img;
  };

  PaintMaster.prototype.setAttributeListeners = function() {
    var name, oldVal, ref, results, self, tmpname;
    self = this;
    ref = this.settings;
    results = [];
    for (name in ref) {
      oldVal = ref[name];
      tmpname = name.toString();
      results.push(this.setAttributeWatchers(this.settings, name));
    }
    return results;
  };

  PaintMaster.prototype.settingChanged = function(name, oldVal, newVal) {
    if (this.activeTool) {
      this.activeTool.onSettingsChange();
    }
    switch (name) {
      case 'canvasWidth':
        return this.fCanvas.setWidth(parseInt(newVal));
      case 'canvasHeight':
        return this.fCanvas.setHeight(parseInt(newVal));
      case 'brushSize':
        return this.fCanvas.freeDrawingBrush.width = parseInt(newVal);
      case 'color':
        return this.fCanvas.freeDrawingBrush.color = parseInt(newVal);
    }
  };

  PaintMaster.prototype.setAttributeWatchers = function(obj, propName) {
    var savedVal, self;
    self = this;
    savedVal = obj["" + propName];
    Object.defineProperty(obj, propName, {
      get: function() {
        return obj["_" + propName];
      },
      set: function(newVal) {
        var event, oldVal;
        oldVal = obj["_" + propName];
        obj["_" + propName] = newVal;
        self.settingChanged(propName, oldVal, newVal);
        event = new CustomEvent('pmSettingsChange', {
          detail: {
            property: propName,
            oldVal: oldVal,
            newVal: newVal
          }
        });
        document.dispatchEvent(event);
        return window.localStorage["pmAttr[" + propName + "]"] = newVal;
      }
    });
    return obj["_" + propName] = savedVal;
  };

  PaintMaster.prototype.drawPalette = function() {
    var color, colors, html, self;
    self = this;
    colors = ['#ff421f', '#00e535', '#000000', '#ff4f81', '#fff24d', '#0096e7', '#919191', '#ffffff'];
    html = "" + (((function() {
      var j, len, results;
      results = [];
      for (j = 0, len = colors.length; j < len; j++) {
        color = colors[j];
        results.push(this.renderColorItem(color));
      }
      return results;
    }).call(this)).join(''));
    this.paletteEl.append(html);
    return $(this.paletteEl).on('click', '.pm-palette__item', function(e) {
      $(self.paletteEl).find('.pm-palette__item').removeClass('pm-palette__item-active');
      $(this).addClass('pm-palette__item-active');
      self.settings.color = $(this).find('div').data('color');
      return self.fCanvas.freeDrawingBrush.color = $(this).find('div').data('color');
    });
  };

  PaintMaster.prototype.drawBrushSizeControl = function() {
    var html, self;
    self = this;
    html = "<div class='pm-aux__control pm-aux__control-brush-size'> <label> Размер кисти: <span>" + (parseInt(this.settings.brushSize)) + "</span> </label> <input type='range' min='1' max='100' value='" + (parseInt(this.settings.brushSize)) + "'> </div>";
    this.auxEl.prepend(html);
    return $(this.auxEl).on('input', '.pm-aux__control-brush-size input', function(e) {
      $(self.auxEl).find('.pm-aux__control-brush-size label span').html(e.currentTarget.valueAsNumber);
      return self.settings.brushSize = e.currentTarget.valueAsNumber;
    });
  };

  PaintMaster.prototype.drawFontSizeControl = function() {
    var html, self;
    self = this;
    html = "<div class='pm-aux__control pm-aux__control-font-size'> <label> Размер шрифта: <span>" + (parseInt(this.settings.fontSize)) + "</span> </label> <input type='range' min='1' max='100' value='" + (parseInt(this.settings.fontSize)) + "'> </div>";
    this.auxEl.prepend(html);
    return $(this.auxEl).on('input', '.pm-aux__control-font-size input', function(e) {
      $(self.auxEl).find('.pm-aux__control-font-size label span').html(e.currentTarget.valueAsNumber);
      return self.settings.fontSize = e.currentTarget.valueAsNumber;
    });
  };

  PaintMaster.prototype.drawCanvasWidthControl = function() {
    var html, self;
    self = this;
    html = "<div class='pm-aux__control pm-aux__control-canvas-width'> <label> Ширина холста: </label> <input type='number' min='1' max='4000' value='" + (parseInt(this.settings.canvasWidth)) + "'> </div>";
    this.auxEl.prepend(html);
    $(this.auxEl).on('change', '.pm-aux__control-canvas-width input', function(e) {
      return self.settings.canvasWidth = e.currentTarget.valueAsNumber;
    });
    return $(document).on('pmSettingsChange', function(e) {
      if (e.originalEvent.detail.property === 'canvasWidth') {
        return $('.pm-aux__control-canvas-width input').val(e.originalEvent.detail.newVal);
      }
    });
  };

  PaintMaster.prototype.drawCanvasHeightControl = function() {
    var html, self;
    self = this;
    html = "<div class='pm-aux__control pm-aux__control-canvas-height'> <label> Высота холста: </span> </label> <input type='number' min='1' max='4000' value='" + (parseInt(this.settings.canvasHeight)) + "'> </div>";
    this.auxEl.prepend(html);
    $(this.auxEl).on('change', '.pm-aux__control-canvas-height input', function(e) {
      return self.settings.canvasHeight = e.currentTarget.valueAsNumber;
    });
    return $(document).on('pmSettingsChange', function(e) {
      if (e.originalEvent.detail.property === 'canvasHeight') {
        return $('.pm-aux__control-canvas-height input').val(e.originalEvent.detail.newVal);
      }
    });
  };

  PaintMaster.prototype.renderColorItem = function(color) {
    return "<div class='pm-palette__item " + (this.settings.color === color ? 'pm-palette__item-active' : '') + "'> <div style='background-color: " + color + "' data-color='" + color + "'> </div> </div>";
  };

  return PaintMaster;

})();

window.PaintMasterPlugin.tools.BaseTool = BaseTool = (function() {
  function BaseTool(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.deactivate = bind(this.deactivate, this);
    this.activate = bind(this.activate, this);
    this.currentFontSize = bind(this.currentFontSize, this);
    this.currentWidth = bind(this.currentWidth, this);
    this.currentColor = bind(this.currentColor, this);
    this.onChange = bind(this.onChange, this);
    this.fCanvas = this.paintMaster.fCanvas;
    this.canvas = this.fCanvas;
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'></div>";
    this.active = false;
    this.help || (this.help = '');
  }

  BaseTool.prototype.onChange = function(e) {
    return 1;
  };

  BaseTool.prototype.onClick = function(e) {};

  BaseTool.prototype.onRemove = function() {
    return this.paintMaster.wrapperEl.find("pm-tool." + this.id).remove();
  };

  BaseTool.prototype.onMouseover = function(e) {
    var targetEl, tooltipPosition;
    tooltipPosition = 'bottom';
    targetEl = $(e.currentTarget);
    if (!(targetEl.find('.pm-tooltip').length > 0)) {
      return targetEl.append("<div class='pm-tooltip pm-tooltip-" + tooltipPosition + "'>" + this.name + "</div>");
    }
  };

  BaseTool.prototype.onMouseleave = function(e) {
    var targetEl;
    targetEl = $(e.currentTarget);
    return targetEl.find('.pm-tooltip').remove();
  };

  BaseTool.prototype.onSubmit = function(e) {};

  BaseTool.prototype.onBackspace = function(e) {
    var activeGroupObject, activeObject, j, len, ref, results;
    activeObject = this.canvas.getActiveObject();
    this.canvas.remove(activeObject);
    if (painter.fCanvas.getActiveGroup()) {
      ref = painter.fCanvas.getActiveGroup();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        activeGroupObject = ref[j];
        results.push(this.canvas.remove(activeGroupObject));
      }
      return results;
    }
  };

  BaseTool.prototype.onSettingsChange = function(settingName, oladVal, newVal) {};

  BaseTool.prototype.currentColor = function() {
    return this.paintMaster.selectedColor || 'red';
  };

  BaseTool.prototype.currentWidth = function() {
    return parseInt(this.paintMaster.settings.brushSize) || 5;
  };

  BaseTool.prototype.currentFontSize = function() {
    return parseInt(this.paintMaster.settings.fontSize) || 14;
  };

  BaseTool.prototype.activate = function() {
    var key, ref, tool;
    ref = this.paintMaster.toolbox;
    for (key in ref) {
      tool = ref[key];
      if (tool !== this) {
        tool.deactivate();
      }
    }
    $(".pm-tool." + this.id).addClass('active');
    this.displayHelp();
    return this.active = true;
  };

  BaseTool.prototype.deactivate = function() {
    $(".pm-tool." + this.id).removeClass('active');
    this.hideHelp();
    this.paintMaster.activeTool = null;
    return this.active = false;
  };

  BaseTool.prototype.mousedown = function(e) {};

  BaseTool.prototype.mousemove = function(e) {};

  BaseTool.prototype.mouseup = function(e) {};

  BaseTool.prototype.displayHelp = function() {
    return;
    this.paintMaster.currentToolNameEl.html(this.name + "</br>");
    this.paintMaster.currentToolNameEl.after("<span>" + this.help + "</span>");
    this.paintMaster.currentToolEl.removeClass('hidden');
    return this.paintMaster.currentToolEl.find('.icon').addClass(this.id);
  };

  BaseTool.prototype.hideHelp = function() {
    return;
    this.paintMaster.currentToolNameEl.html('');
    this.paintMaster.currentToolNameEl.nextAll().remove();
    this.paintMaster.currentToolEl.addClass('hidden');
    return this.paintMaster.currentToolEl.find('.icon').removeClass(this.id);
  };

  BaseTool.prototype.unlockDrag = function() {
    var canvasObj, j, len, ref;
    this.canvas.selection = true;
    ref = this.canvas._objects;
    for (j = 0, len = ref.length; j < len; j++) {
      canvasObj = ref[j];
      canvasObj.lockMovementX = false;
      canvasObj.lockMovementY = false;
      canvasObj.lockScalingX = false;
      canvasObj.lockScalingY = false;
    }
    return this.canvas.renderAll();
  };

  BaseTool.prototype.lockDrag = function() {
    var canvasObj, j, len, ref;
    this.canvas.selection = false;
    ref = this.canvas._objects;
    for (j = 0, len = ref.length; j < len; j++) {
      canvasObj = ref[j];
      canvasObj.lockMovementX = true;
      canvasObj.lockMovementY = true;
      canvasObj.lockScalingX = true;
      canvasObj.lockScalingY = true;
    }
    return this.canvas.renderAll();
  };

  BaseTool.prototype.displayPalette = function() {
    return $(this.paintMaster.paletteEl).css('display', 'block');
  };

  BaseTool.prototype.hidePalette = function() {
    return $(this.paintMaster.paletteEl).css('display', 'none');
  };

  BaseTool.prototype.displayBrushSize = function() {
    return 1;
  };

  BaseTool.prototype.hideBrushSize = function() {
    return 1;
  };

  BaseTool.prototype.setAuxDisplay = function(selector, display) {
    return $(selector).css('display', display);
  };

  return BaseTool;

})();

window.PaintMasterPlugin.tools.AddText = AddText = (function(superClass) {
  extend(AddText, superClass);

  function AddText(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.mousedown = bind(this.mousedown, this);
    this.name = 'Текст';
    this.help = 'Нажмите на появившееся поле чтобы редактировать текст';
    this.id = 'add-text';
    AddText.__super__.constructor.call(this, this.paintMaster);
  }

  AddText.prototype.activate = function() {
    AddText.__super__.activate.call(this);
    this.displayPalette();
    return this.setAuxDisplay('.pm-aux__control-font-size', 'block');
  };

  AddText.prototype.deactivate = function() {
    AddText.__super__.deactivate.call(this);
    return this.setAuxDisplay('.pm-aux__control-font-size', 'none');
  };

  AddText.prototype.mousedown = function(e) {
    var mouse;
    mouse = this.canvas.getPointer(e.e);
    if (this.active) {
      this.iText = new fabric.IText('', {
        fontFamily: 'arial black',
        left: mouse.x,
        top: mouse.y,
        fill: this.paintMaster.settings.color,
        fontSize: parseInt(this.paintMaster.settings.fontSize)
      });
      this.fCanvas.add(this.iText);
      this.canvas.renderAll().setActiveObject(this.iText);
      this.canvas.getActiveObject().trigger('dblclick');
      this.iText.enterEditing();
      AddText.__super__.mousedown.call(this);
    }
    return this.deactivate();
  };

  return AddText;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.ChooseColor = ChooseColor = (function(superClass) {
  extend(ChooseColor, superClass);

  function ChooseColor(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.deactivate = bind(this.deactivate, this);
    this.activate = bind(this.activate, this);
    this.name = 'Выбрать цвет';
    this.id = 'choose-color';
    ChooseColor.__super__.constructor.call(this, this.paintMaster);
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "' style='color: " + this.paintMaster.settings.color + "'> </div>";
    this.colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#FFFFFF'];
  }

  ChooseColor.prototype.activate = function(e) {
    var paintMaster, self;
    ChooseColor.__super__.activate.call(this);
    this.displayPanel();
    paintMaster = this.paintMaster;
    self = this;
    return $(this.paintMaster.toolboxEl.parent()).on('click', '.pm-choose-color-item', function(e) {
      paintMaster.selectedColor = $(this).data('color');
      paintMaster.fCanvas.freeDrawingBrush.color = $(this).data('color');
      paintMaster.toolboxEl.find('.pm-tool.choose-color').css('color', $(this).data('color'));
      window.localStorage['pmAttr[color]'] = $(this).data('color');
      return self.deactivate();
    });
  };

  ChooseColor.prototype.deactivate = function(e) {
    ChooseColor.__super__.deactivate.call(this);
    return this.hidePanel();
  };

  ChooseColor.prototype.displayPanel = function() {
    var color, html, toolboxWrapper;
    if ($('.pm-block.pm-choose-color').length) {
      return $('.pm-block.pm-choose-color').removeClass('hidden');
    }
    html = "<div class='pm-block pm-choose-color'> " + (((function() {
      var j, len, ref, results;
      ref = this.colors;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        color = ref[j];
        results.push(this.renderColorItem(color));
      }
      return results;
    }).call(this)).join('')) + " </div>";
    toolboxWrapper = this.paintMaster.toolboxEl.parent();
    return toolboxWrapper.append(html);
  };

  ChooseColor.prototype.renderColorItem = function(color) {
    return "<div class='pm-choose-color-item'><div style='background-color: " + color + "' data-color='" + color + "'>2</div></div>";
  };

  ChooseColor.prototype.hidePanel = function() {
    return $('.pm-block.pm-choose-color').addClass('hidden');
  };

  return ChooseColor;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.ClipboardBackgroundPaste = ClipboardBackgroundPaste = (function(superClass) {
  extend(ClipboardBackgroundPaste, superClass);

  function ClipboardBackgroundPaste(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onPasteEvent = bind(this.onPasteEvent, this);
    this.name = 'Вставить фон из буфера';
    this.help = 'Чтобы фон картинку из буфера, нажмите <b>CTRL-V</b> </br> <b>Внимание!</b> Размеры холста будут изменены в соответствии с размерами вставленного изображения';
    this.id = 'clipboard-background-paste';
    ClipboardBackgroundPaste.__super__.constructor.call(this, this.paintMaster);
    this.clickEventListener = function(e) {
      return $('#pm-image-paste-field').focus();
    };
  }

  ClipboardBackgroundPaste.prototype.activate = function() {
    var helpHtml, html, pasteButtons;
    this.x = window.scrollX;
    this.y = window.scrollY;
    window.myPaste = this.onPasteEvent;
    html = "<div id='pm-image-paste-field' contenteditable='true' onpaste='window.myPaste(this, event)' style='width: 1px; height: 1px; overflow: hidden;' ></div>";
    pasteButtons = true ? "<span>&#8984;</span>&nbsp;&#8212;&nbsp;<span>V</span>" : "<span>Ctrl</span>&nbsp;&#8212;&nbsp;<span>V</span>";
    if (this.paintMaster.settings.canvasWidth > 400) {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> <div> Нажмите <div class='important'>" + pasteButtons + "</div> <div> чтобы вставить картинку </div> <div> из буфера </div> </div> </div>";
    } else if (this.paintMaster.settings.canvasWidth > 300) {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> <div class='important'>" + pasteButtons + "</div> </div> </div>";
    } else {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> Ctrl&nbsp;&#8212;&nbsp;V </br> &#8984;&nbsp;&#8212;&nbsp;V </div> </div>";
    }
    this.pasteElem = $(html).appendTo(this.paintMaster.containerEl[1]);
    this.helpElem = $(helpHtml).appendTo($(this.paintMaster.containerEl[1]));
    this.pasteElem.focus();
    window.addEventListener('click', this.clickEventListener, false);
    return ClipboardBackgroundPaste.__super__.activate.call(this);
  };

  ClipboardBackgroundPaste.prototype.deactivate = function() {
    ClipboardBackgroundPaste.__super__.deactivate.call(this);
    if (this.pasteElem) {
      this.pasteElem.remove();
    }
    if (this.helpElem) {
      this.helpElem.remove();
    }
    return window.removeEventListener('click', this.clickEventListener, false);
  };

  ClipboardBackgroundPaste.prototype.onPasteEvent = function(elem, event) {
    if (event.clipboardData && event.clipboardData.items) {
      return this.extractImageFromClipboard(event);
    } else {
      return this.tryToExtractImageFromContainer();
    }
  };

  ClipboardBackgroundPaste.prototype.tryToExtractImageFromContainer = function() {
    var pastedImage;
    pastedImage = this.pasteElem.find('img');
    if (pastedImage.length) {
      return this.onImagePaste(pastedImage.attr('src'));
    } else {
      return setTimeout((function() {
        return this.tryToExtractImageFromContainer();
      }).bind(this), 100);
    }
  };

  ClipboardBackgroundPaste.prototype.extractImageFromClipboard = function(event) {
    var cbData, cbDataItem, i, imageData, imageURL, type;
    cbData = event.clipboardData;
    i = 0;
    while (i < cbData.items.length) {
      cbDataItem = cbData.items[i];
      type = cbDataItem.type;
      if (type.indexOf('image') !== -1) {
        imageData = cbDataItem.getAsFile();
        imageURL = window.URL.createObjectURL(imageData);
        this.onImagePaste(imageURL);
      }
      i++;
    }
  };

  ClipboardBackgroundPaste.prototype.onImagePaste = function(imageURL) {
    var image;
    if (!this.active) {
      return;
    }
    image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageURL;
    return image.onload = (function() {
      var imgInstance;
      imgInstance = new fabric.Image(image, {});
      this.paintMaster.settings.canvasHeight = imgInstance.height;
      this.paintMaster.settings.canvasWidth = imgInstance.width;
      this.canvas.setBackgroundImage(imgInstance);
      this.canvas.renderAll();
      return this.deactivate();
    }).bind(this);
  };

  return ClipboardBackgroundPaste;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.ClipboardImagePaste = ClipboardImagePaste = (function(superClass) {
  extend(ClipboardImagePaste, superClass);

  function ClipboardImagePaste(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onPasteEvent = bind(this.onPasteEvent, this);
    this.name = 'Вставить картинку из буфера';
    this.help = 'Чтобы вставить картинку из буфера, нажмите <b>CTRL-V</b> </br> <b>Внимание!</b> Размеры холста будут изменены в соответствии с размерами вставленного изображения';
    this.id = 'clipboard-image-paste';
    this.resize = true;
    ClipboardImagePaste.__super__.constructor.call(this, this.paintMaster);
    this.clickEventListener = function(e) {
      return $('#pm-image-paste-field').focus();
    };
  }

  ClipboardImagePaste.prototype.activate = function() {
    var helpHtml, html, pasteButtons;
    this.x = window.scrollX;
    this.y = window.scrollY;
    window.myPaste = this.onPasteEvent;
    html = "<div id='pm-image-paste-field' contenteditable='true' onpaste='window.myPaste(this, event)' style='width: 1px; height: 1px; overflow: hidden; outline: none;' ></div>";
    pasteButtons = navigator.platform.match(/Mac/) !== null ? "<span>&#8984;</span>&nbsp;+&nbsp;<span>V</span>" : "<span>Ctrl</span>&nbsp;+&nbsp;<span>V</span>";
    if (this.paintMaster.settings.canvasWidth > 400) {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> <div> Нажмите <div class='important'>" + pasteButtons + "</div> <div> чтобы вставить картинку </div> <div> из буфера </div> </div> </div>";
    } else if (this.paintMaster.settings.canvasWidth > 300) {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> <div class='important'>" + pasteButtons + "</div> </div> </div>";
    } else {
      helpHtml = "<div class='pm-canvas-overlay'> <div class='pm-canvas-overlay__title'> Ctrl&nbsp;&#8212;&nbsp;V </br> &#8984;&nbsp;&#8212;&nbsp;V </div> </div>";
    }
    this.pasteElem = $(html).appendTo(this.paintMaster.containerEl[1]);
    this.helpElem = $(helpHtml).appendTo($(this.paintMaster.containerEl[1]));
    this.pasteElem.focus();
    window.addEventListener('click', this.clickEventListener, false);
    return ClipboardImagePaste.__super__.activate.call(this);
  };

  ClipboardImagePaste.prototype.deactivate = function() {
    ClipboardImagePaste.__super__.deactivate.call(this);
    if (this.pasteElem) {
      this.pasteElem.remove();
    }
    if (this.helpElem) {
      this.helpElem.remove();
    }
    return window.removeEventListener('click', this.clickEventListener, false);
  };

  ClipboardImagePaste.prototype.onPasteEvent = function(elem, event) {
    if (event.clipboardData && event.clipboardData.items) {
      return this.extractImageFromClipboard(event);
    } else {
      return this.tryToExtractImageFromContainer();
    }
  };

  ClipboardImagePaste.prototype.tryToExtractImageFromContainer = function() {
    var pastedImage;
    pastedImage = this.pasteElem.find('img');
    if (pastedImage.length) {
      return this.onImagePaste(pastedImage.attr('src'));
    } else {
      return setTimeout((function() {
        return this.tryToExtractImageFromContainer();
      }).bind(this), 100);
    }
  };

  ClipboardImagePaste.prototype.extractImageFromClipboard = function(event) {
    var cbData, cbDataItem, i, imageData, imageURL, type;
    cbData = event.clipboardData;
    i = 0;
    while (i < cbData.items.length) {
      cbDataItem = cbData.items[i];
      type = cbDataItem.type;
      if (type.indexOf('image') !== -1) {
        imageData = cbDataItem.getAsFile();
        imageURL = window.URL.createObjectURL(imageData);
        this.onImagePaste(imageURL);
      }
      i++;
    }
  };

  ClipboardImagePaste.prototype.onImagePaste = function(imageURL) {
    var image;
    if (!this.active) {
      return;
    }
    image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageURL;
    return image.onload = (function() {
      var imgInstance;
      imgInstance = new fabric.Image(image, {});
      this.canvas.add(imgInstance);
      this.canvas.renderAll();
      this.deactivate();
      if (this.resize) {
        this.paintMaster.settings.canvasHeight = imgInstance.height;
        this.paintMaster.settings.canvasWidth = imgInstance.width;
        return this.resize = false;
      }
    }).bind(this);
  };

  return ClipboardImagePaste;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.Crop = Crop = (function(superClass) {
  extend(Crop, superClass);

  function Crop(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.name = 'Обрезать картинку';
    this.help = 'Выберите участок, который должен остаться </br> <b>Enter</b> - применить </br> <b>Backspace</b> - отмена';
    this.id = 'crop';
    this.canvas = this.paintMaster.fCanvas;
    this.shadeFill = '5E5E5E';
    this.shadeOpacity = 0.7;
    Crop.__super__.constructor.call(this, this.paintMaster);
  }

  Crop.prototype.activate = function() {
    var ts;
    Crop.__super__.activate.call(this);
    this.trueSight = new fabric.Rect({
      width: this.canvas.width,
      height: this.canvas.height,
      left: 50,
      top: 50,
      width: 100,
      height: 100,
      fill: '',
      lockRotation: true
    });
    this.canvas.add(this.trueSight);
    ts = this.trueSight;
    this.addBlindZones();
    this.canvas.moveTo(this.trueSight, this.canvas._objects.length);
    return this.canvas.setActiveObject(this.trueSight);
  };

  Crop.prototype.deactivate = function() {
    Crop.__super__.deactivate.call(this);
    if (this.paintMaster.toolbox['accept-crop']) {
      this.paintMaster.removeToolboxItem('accept-crop');
    }
    this.canvas.remove(this.trueSight);
    this.canvas.remove(this.leftBlindZone);
    this.canvas.remove(this.topBlindZone);
    this.canvas.remove(this.rightBlindZone);
    return this.canvas.remove(this.bottomBlindZone);
  };

  Crop.prototype.mousedown = function(e) {
    var mouse;
    mouse = this.canvas.getPointer(e);
    this.x = mouse.x;
    return this.y = mouse.y;
  };

  Crop.prototype.mousemove = function(e) {
    return this.moveBlindZones();
  };

  Crop.prototype.mouseup = function(e) {
    var mouse;
    mouse = this.canvas.getPointer(e);
    return this.addRectToCanvas(this.x, this.y, mouse.x, mouse.y);
  };

  Crop.prototype.addRectToCanvas = function(startX, startY, currentX, currentY) {};

  Crop.prototype.addBlindZones = function() {
    var xx, xy, yx, yy;
    xx = this.trueSight.left;
    xy = this.trueSight.left + this.trueSight.width;
    yy = this.trueSight.top;
    yx = this.trueSight.top + this.trueSight.height;
    this.leftBlindZone = this.addBlindZone({
      height: this.canvas.height,
      width: xx,
      left: 0,
      top: 0
    });
    this.topBlindZone = this.addBlindZone({
      height: xy - this.trueSight.height,
      width: this.canvas.width * 2,
      left: xx,
      top: 0
    });
    this.rightBlindZone = this.addBlindZone({
      height: this.canvas.height * 2,
      width: this.canvas.width - xy,
      left: xy,
      top: yy
    });
    return this.bottomBlindZone = this.addBlindZone({
      height: this.canvas.height * 2,
      width: this.trueSight.width * this.trueSight.scaleX,
      left: xx,
      top: xy
    });
  };

  Crop.prototype.addBlindZone = function(params) {
    var shade;
    shade = new fabric.Rect({
      width: params.width,
      height: params.height,
      left: params.left,
      top: params.top,
      fill: this.shadeFill,
      opacity: this.shadeOpacity,
      lockMovementX: true,
      lockMovementY: true,
      selectable: false
    });
    this.canvas.add(shade);
    return shade;
  };

  Crop.prototype.moveBlindZones = function() {
    var xx, xy, yx, yy;
    xx = this.trueSight.left;
    xy = this.trueSight.left + this.trueSight.width * this.trueSight.scaleX;
    yy = this.trueSight.top;
    yx = this.trueSight.top + this.trueSight.height * this.trueSight.scaleY;
    this.leftBlindZone.set('width', xx);
    this.topBlindZone.set('height', yy).set('left', xx);
    this.rightBlindZone.set('left', xy).set('width', this.canvas.width - xy).set('top', yy);
    return this.bottomBlindZone.set('width', this.trueSight.width * this.trueSight.scaleX).set('left', xx).set('top', yx);
  };

  Crop.prototype.onSubmit = function(e) {
    var ctx, height, img, left, scaleX, scaleY, top, width;
    width = this.trueSight.width * this.trueSight.scaleX;
    height = this.trueSight.height * this.trueSight.scaleY;
    left = this.trueSight.left;
    top = this.trueSight.top;
    scaleX = this.trueSight.scaleX;
    scaleY = this.trueSight.scaleY;
    ctx = this.canvas.contextTop || this.canvas.contextContainer;
    if (top < 0) {
      height = height + top;
      top = 0;
    }
    if (left < 0) {
      width = width + left;
      left = 0;
    }
    if ((top + height) > this.canvas.height) {
      height = this.canvas.height - top;
      top = this.canvas.height - height;
    }
    if ((left + width) > this.canvas.width) {
      width = this.canvas.width - left;
      left = this.canvas.width - width;
    }
    this.canvas.deactivateAll().renderAll();
    img = this.canvas.toDataURL({
      format: 'png',
      left: left,
      top: top,
      width: width,
      height: height,
      crossOrigin: 'anonymous'
    });
    this.canvas.clear().renderAll();
    this.paintMaster.settings.canvasWidth = width;
    this.paintMaster.settings.canvasHeight = height;
    this.canvas.setBackgroundImage(img, (function() {
      return this.renderAll();
    }).bind(this.canvas));
    Crop.__super__.onSubmit.call(this);
    return this.deactivate();
  };

  Crop.prototype.onBackspace = function(e) {
    return this.deactivate();
  };

  return Crop;

})(window.PaintMasterPlugin.tools.BaseTool);

strSVG = '<?xml version="1.0" encoding="iso-8859-1"?> <!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="268.832px" height="268.832px" viewBox="0 0 268.832 268.832" style="enable-background:new 0 0 268.832 268.832;" xml:space="preserve"> <g> <path d="M223.255,167.493c-4.881-4.882-12.797-4.882-17.678,0l-58.661,58.661V12.5c0-6.903-5.598-12.5-12.5-12.5 c-6.904,0-12.5,5.597-12.5,12.5v213.654l-58.661-58.659c-4.883-4.881-12.797-4.881-17.678,0c-4.883,4.882-4.883,12.796,0,17.678 l80,79.998c2.439,2.44,5.64,3.661,8.839,3.661s6.397-1.221,8.839-3.661l80-80C228.137,180.289,228.137,172.375,223.255,167.493z"/> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>';

window.PaintMasterPlugin.tools.DrawArrow = DrawArrow = (function(superClass) {
  extend(DrawArrow, superClass);

  function DrawArrow(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onClick = bind(this.onClick, this);
    this.name = 'Стрелка';
    this.id = 'draw-rect';
    this.active = false;
    this.canvas = this.paintMaster.fCanvas;
    DrawArrow.__super__.constructor.call(this, this.paintMaster);
  }

  DrawArrow.prototype.activate = function() {
    DrawArrow.__super__.activate.call(this);
    this.lockDrag();
    this.displayPalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'block');
  };

  DrawArrow.prototype.deactivate = function() {
    DrawArrow.__super__.deactivate.call(this);
    this.unlockDrag();
    this.hidePalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'none');
  };

  DrawArrow.prototype.mousedown = function(e) {
    var self;
    this.initialMouse = this.canvas.getPointer(e.e);
    self = this;
    fabric.loadSVGFromString(strSVG, function(arrow) {
      arrow = arrow[0];
      arrow.fill = self.paintMaster.settings.color;
      arrow.top = self.initialMouse.y;
      arrow.left = self.initialMouse.x;
      arrow.originX = 'center';
      arrow.originY = 'top';
      arrow.angle = 10;
      arrow.scaleX = 0.1 * parseInt(self.paintMaster.settings.brushSize);
      arrow.scaleY = 0.1;
      self.initialHeight = arrow.height;
      self.canvas.add(arrow).renderAll();
      return self.canvas.setActiveObject(arrow);
    });
    return this.drawing = true;
  };

  DrawArrow.prototype.mousemove = function(e) {
    var angleInDegrees, arrow, currentX, currentY, deltaHeight, deltaX, deltaY, distance, mouse, proption;
    if (!this.drawing) {
      return;
    }
    mouse = this.canvas.getPointer(e.e);
    currentX = mouse.x;
    currentY = mouse.y;
    deltaY = currentY - this.initialMouse.y;
    deltaX = currentX - this.initialMouse.x;
    angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI - 90;
    distance = Math.sqrt(Math.abs(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));
    deltaHeight = this.initialHeight - distance;
    proption = Math.abs(distance / this.initialHeight);
    arrow = this.canvas.getActiveObject();
    arrow.set('angle', angleInDegrees);
    arrow.set('scaleY', proption);
    this.aArrow = arrow;
    return this.canvas.renderAll();
  };

  DrawArrow.prototype.mouseup = function(e) {
    this.drawing = false;
    this.canvas.remove(this.canvas.getActiveObject());
    this.canvas.add(this.aArrow);
    this.canvas.setActiveObject(this.aArrow);
    this.lockDrag();
    return this.canvas.deactivateAll().renderAll();
  };

  DrawArrow.prototype.onClick = function() {};

  return DrawArrow;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawEllipse = DrawEllipse = (function(superClass) {
  extend(DrawEllipse, superClass);

  function DrawEllipse(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onClick = bind(this.onClick, this);
    this.name = 'Окружность';
    this.id = 'draw-ellipse';
    DrawEllipse.__super__.constructor.call(this, this.paintMaster);
  }

  DrawEllipse.prototype.onClick = function() {
    return;
    if (this.active === true) {
      return this.paintMaster.wrapperEl.find(".pm-tool." + this.id).addClass('active');
    } else {
      return this.paintMaster.wrapperEl.find(".pm-tool." + this.id).removeClass('active');
    }
  };

  DrawEllipse.prototype.activate = function() {
    DrawEllipse.__super__.activate.call(this);
    this.displayPalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'block');
  };

  DrawEllipse.prototype.deactivate = function() {
    DrawEllipse.__super__.deactivate.call(this);
    this.hidePalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'none');
  };

  DrawEllipse.prototype.mousedown = function(e) {
    var circle, mouse;
    this.drawing = true;
    this.lockDrag();
    this.canvas = this.paintMaster.fCanvas;
    mouse = this.canvas.getPointer(e.e);
    this.y = mouse.y;
    this.x = mouse.x;
    circle = new fabric.Ellipse({
      rx: 1,
      ry: 1,
      left: this.x,
      top: this.y,
      fill: '',
      stroke: this.paintMaster.settings.color,
      strokeWidth: parseInt(this.paintMaster.settings.brushSize)
    });
    return this.canvas.add(circle).renderAll().setActiveObject(circle);
  };

  DrawEllipse.prototype.mousemove = function(e) {
    var circle, currentX, currentY, rx, ry;
    if (!this.drawing) {
      return;
    }
    currentX = this.canvas.getPointer(e.e).x;
    currentY = this.canvas.getPointer(e.e).y;
    circle = this.canvas.getActiveObject();
    rx = Math.abs(currentX - this.x) / 2;
    ry = Math.abs(currentY - this.y) / 2;
    circle.set('rx', rx);
    circle.set('ry', ry);
    if (this.x > currentX) {
      circle.set('left', currentX);
    }
    if (this.y > currentY) {
      circle.set('top', currentY);
    }
    return this.canvas.renderAll();
  };

  DrawEllipse.prototype.mouseup = function(e) {
    var aCircle, circle;
    console.log(123);
    this.drawing = false;
    aCircle = this.canvas.getActiveObject();
    circle = new fabric.Ellipse({
      rx: aCircle.rx,
      ry: aCircle.ry,
      left: aCircle.left,
      top: aCircle.top,
      fill: '',
      stroke: this.paintMaster.settings.color,
      strokeWidth: parseInt(this.paintMaster.settings.brushSize)
    });
    this.canvas.add(circle).renderAll();
    this.canvas.remove(this.canvas.getActiveObject());
    this.canvas.setActiveObject(circle);
    if (aCircle.rx === 1 && aCircle.ry === 1) {
      this.canvas.remove(this.canvas.getActiveObject());
      return;
    }
    this.unlockDrag();
    return this.canvas.deactivateAll().renderAll();
  };

  return DrawEllipse;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawRect = DrawRect = (function(superClass) {
  extend(DrawRect, superClass);

  function DrawRect(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onClick = bind(this.onClick, this);
    this.name = 'Прямоугольник';
    this.id = 'draw-rect';
    this.active = false;
    this.canvas = this.paintMaster.fCanvas;
    DrawRect.__super__.constructor.call(this, this.paintMaster);
  }

  DrawRect.prototype.activate = function() {
    DrawRect.__super__.activate.call(this);
    this.lockDrag();
    this.displayPalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'block');
  };

  DrawRect.prototype.deactivate = function() {
    DrawRect.__super__.deactivate.call(this);
    this.unlockDrag();
    this.hidePalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'none');
  };

  DrawRect.prototype.mousedown = function(e) {
    var mouse, square;
    this.drawing = true;
    this.lockDrag();
    this.canvas.deactivateAll().renderAll();
    this.canvas = this.paintMaster.fCanvas;
    mouse = this.canvas.getPointer(e.e);
    this.x = mouse.x;
    this.y = mouse.y;
    square = new fabric.Rect({
      width: 10,
      height: 10,
      left: this.x,
      top: this.y,
      fill: '',
      stroke: this.paintMaster.settings.color,
      strokeWidth: parseInt(this.paintMaster.settings.brushSize)
    });
    return this.canvas.add(square).renderAll().setActiveObject(square);
  };

  DrawRect.prototype.mousemove = function(e) {
    var currentX, currentY, height, mouse, square, width;
    if (!this.drawing) {
      return;
    }
    mouse = this.canvas.getPointer(e.e);
    currentX = mouse.x;
    currentY = mouse.y;
    console.log(currentX, currentY);
    height = Math.round(Math.abs(this.y - currentY));
    width = Math.round(Math.abs(this.x - currentX));
    square = this.canvas.getActiveObject();
    square.set('width', width);
    if (this.x > currentX) {
      square.set('left', this.x - width);
    }
    console.log("left: " + (this.x - width));
    square.set('height', height);
    if (this.y > currentY) {
      square.set('top', this.y - height);
    }
    return this.canvas.renderAll();
  };

  DrawRect.prototype.mouseup = function(e) {
    var aSquare, square;
    this.drawing = false;
    aSquare = this.canvas.getActiveObject();
    square = new fabric.Rect({
      width: aSquare.width,
      height: aSquare.height,
      left: aSquare.left,
      top: aSquare.top,
      fill: '',
      stroke: this.paintMaster.settings.color,
      strokeWidth: parseInt(this.paintMaster.settings.brushSize)
    });
    this.canvas.add(square).renderAll();
    this.canvas.remove(this.canvas.getActiveObject());
    this.canvas.setActiveObject(square);
    if (aSquare.width === 10 && aSquare.height === 10) {
      this.canvas.remove(this.canvas.getActiveObject());
      return;
    }
    this.lockDrag();
    return this.canvas.deactivateAll().renderAll();
  };

  DrawRect.prototype.onClick = function() {};

  return DrawRect;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawingModeSwitch = DrawingModeSwitch = (function(superClass) {
  extend(DrawingModeSwitch, superClass);

  function DrawingModeSwitch(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onClick = bind(this.onClick, this);
    this.name = 'Карандаш';
    this.id = 'dr-mode-switch';
    DrawingModeSwitch.__super__.constructor.call(this, this.paintMaster);
  }

  DrawingModeSwitch.prototype.onClick = function() {
    return this.paintMaster.fCanvas.isDrawingMode = this.active;
  };

  DrawingModeSwitch.prototype.activate = function() {
    DrawingModeSwitch.__super__.activate.call(this);
    this.paintMaster.fCanvas.isDrawingMode = this.active;
    this.displayPalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'block');
  };

  DrawingModeSwitch.prototype.deactivate = function() {
    DrawingModeSwitch.__super__.deactivate.call(this);
    this.paintMaster.fCanvas.isDrawingMode = this.active;
    this.hidePalette();
    return this.setAuxDisplay('.pm-aux__control-brush-size', 'none');
  };

  return DrawingModeSwitch;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.SettingsItem = SettingsItem = (function() {
  function SettingsItem(paintMaster1, params1) {
    this.paintMaster = paintMaster1;
    this.params = params1;
    this.pmProperty = this.params.pmAttr;
    this.callbacks = this.params.callbacks;
    this.eventListeners = [
      function(paintMaster, settingItemParams) {
        return document.addEventListener('pmSettingsChange', (function(e) {
          if (e.detail.property === this.pmProperty) {
            return $("." + settingItemParams.cssClass).html(paintMaster.settings[e.detail.property]);
          }
        }).bind(this));
      }
    ];
    return;
  }

  SettingsItem.prototype.render = function() {
    return "<div class='pm-settings-element'> <label> " + this.params.label + ": </label> <span class='pm-settings-value " + this.params.cssClass + "'> " + this.paintMaster.settings[this.params.pmAttr] + " </span> <span class='pm-settings-input-container'> " + this.params.htmlInput + " </span> </div>";
  };

  SettingsItem.prototype.setCallbacks = function() {
    var callback, j, len, ref, results;
    if (this.callbacks == null) {
      return;
    }
    ref = this.callbacks;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      callback = ref[j];
      results.push(callback.call(this, this.paintMaster));
    }
    return results;
  };

  SettingsItem.prototype.setEventsListeners = function() {
    var eventListener, j, len, ref, results;
    if (this.eventListeners == null) {
      return;
    }
    ref = this.eventListeners;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      eventListener = ref[j];
      results.push(eventListener.call(this, this.paintMaster, this.params));
    }
    return results;
  };

  return SettingsItem;

})();

window.PaintMasterPlugin.tools.OpenSettings = OpenSettings = (function(superClass) {
  extend(OpenSettings, superClass);

  function OpenSettings(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onChange = bind(this.onChange, this);
    this.deactivate = bind(this.deactivate, this);
    this.activate = bind(this.activate, this);
    this.name = 'Настройки';
    this.id = 'open-settings';
    OpenSettings.__super__.constructor.call(this, this.paintMaster);
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'> </div>";
  }

  OpenSettings.prototype.activate = function(e) {
    OpenSettings.__super__.activate.call(this);
    this.displaySettingsPanel();
    this.setSettingsCallbacks();
    return this.setSettingsEventListeners();
  };

  OpenSettings.prototype.deactivate = function(e) {
    OpenSettings.__super__.deactivate.call(this);
    return this.hideSettingsPanel();
  };

  OpenSettings.prototype.onChange = function(e) {
    this.paintMaster.selectedColor = e.currentTarget.value;
    this.paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value;
    return this.paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value);
  };

  OpenSettings.prototype.onSettingsChange = function(settingName, oladVal, newVal) {};

  OpenSettings.prototype.displaySettingsPanel = function() {
    var html, settingItem, toolboxWrapper;
    if ($('.pm-block.pm-settings').length) {
      return $('.pm-block.pm-settings').removeClass('hidden');
    }
    html = "<div class='pm-block pm-settings'> " + (((function() {
      var j, len, ref, results;
      ref = this.getSettingsItems();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        settingItem = ref[j];
        results.push(settingItem.render());
      }
      return results;
    }).call(this)).join('')) + " </div>";
    toolboxWrapper = this.paintMaster.toolboxEl.parent();
    return toolboxWrapper.append(html);
  };

  OpenSettings.prototype.hideSettingsPanel = function() {
    return $('.pm-block.pm-settings').addClass('hidden');
  };

  OpenSettings.prototype.setSettingsCallbacks = function() {
    var j, len, ref, results, settingItem;
    ref = this.getSettingsItems();
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      settingItem = ref[j];
      results.push(settingItem.setCallbacks());
    }
    return results;
  };

  OpenSettings.prototype.setSettingsEventListeners = function() {
    var j, len, ref, results, settingItem;
    ref = this.getSettingsItems();
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      settingItem = ref[j];
      results.push(settingItem.setEventsListeners());
    }
    return results;
  };

  OpenSettings.prototype.getSettingsItems = function() {
    var brushSizeItem, canvasHeightItem, canvasWidthItem, defaultSettingsItems, fontSizeItem;
    if (defaultSettingsItems) {
      return defaultSettingsItems;
    }
    defaultSettingsItems = [];
    fontSizeItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Размер шрифта',
      cssClass: 'pm-font-size-value',
      pmAttr: 'fontSize',
      htmlInput: "<input type='range' min='1' max='100' class='pm-font-size' value='" + (parseInt(this.paintMaster.settings.fontSize)) + "'>",
      callbacks: [
        (function(paintMaster) {
          return $(paintMaster.containerEl).on('input', '.pm-font-size', (function(e) {
            return this.settings.fontSize = e.currentTarget.valueAsNumber;
          }).bind(paintMaster));
        })
      ]
    });
    brushSizeItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Размер кисти',
      cssClass: 'pm-brush-size-value',
      pmAttr: 'brushSize',
      htmlInput: "<input type='range' min='1' max='100' class='pm-brush-size' value='" + (parseInt(this.paintMaster.settings.brushSize)) + "'>",
      callbacks: [
        (function(paintMaster) {
          return $(paintMaster.containerEl).on('input', '.pm-brush-size', (function(e) {
            return this.settings.brushSize = e.currentTarget.valueAsNumber;
          }).bind(paintMaster));
        })
      ]
    });
    canvasWidthItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Ширина холста',
      cssClass: 'pm-canvas-width-value',
      pmAttr: 'canvasWidth',
      htmlInput: "<input type='range' min='32' max='4096' class='pm-canvas-width' value='" + (parseInt(this.paintMaster.settings.canvasWidth)) + "'>",
      callbacks: [
        (function(paintMaster) {
          return $(paintMaster.containerEl).on('input', '.pm-canvas-width', (function(e) {
            return this.settings.canvasWidth = e.currentTarget.valueAsNumber;
          }).bind(paintMaster));
        })
      ]
    });
    canvasHeightItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Высота холста',
      cssClass: 'pm-canvas-height-value',
      pmAttr: 'canvasHeight',
      htmlInput: "<input type='range' min='32' max='4096' class='pm-canvas-height' value='" + (parseInt(this.paintMaster.settings.canvasHeight)) + "'>",
      callbacks: [
        (function(paintMaster) {
          return $(paintMaster.containerEl).on('input', '.pm-canvas-height', (function(e) {
            return this.settings.canvasHeight = e.currentTarget.valueAsNumber;
          }).bind(paintMaster));
        })
      ]
    });
    defaultSettingsItems.push(fontSizeItem, brushSizeItem, canvasWidthItem, canvasHeightItem);
    return defaultSettingsItems;
  };

  return OpenSettings;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.SelectColor = SelectColor = (function(superClass) {
  extend(SelectColor, superClass);

  function SelectColor(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onChange = bind(this.onChange, this);
    this.name = 'Выбор цвета';
    this.id = 'select-color';
    SelectColor.__super__.constructor.call(this, this.paintMaster);
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'> <input type='color' class='pm-colorpicker' /> </div>";
  }

  SelectColor.prototype.activate = function() {
    var key, ref, results, tool;
    ref = this.paintMaster.toolbox;
    results = [];
    for (key in ref) {
      tool = ref[key];
      results.push(tool.deactivate());
    }
    return results;
  };

  SelectColor.prototype.onChange = function(e) {
    this.paintMaster.selectedColor = e.currentTarget.value;
    this.paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value;
    return this.paintMaster.toolboxEl.find('.pm-tool.select-color').css('color', e.currentTarget.value);
  };

  return SelectColor;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.WidthAndHeightSettings = WidthAndHeightSettings = (function(superClass) {
  extend(WidthAndHeightSettings, superClass);

  function WidthAndHeightSettings(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.name = 'Высота и ширина холста';
    this.id = 'open-settings';
    this.active = false;
    this.canvas = this.paintMaster.fCanvas;
    WidthAndHeightSettings.__super__.constructor.call(this, this.paintMaster);
  }

  WidthAndHeightSettings.prototype.activate = function() {
    WidthAndHeightSettings.__super__.activate.call(this);
    this.lockDrag();
    this.setAuxDisplay('.pm-aux__control-canvas-width', 'block');
    return this.setAuxDisplay('.pm-aux__control-canvas-height', 'block');
  };

  WidthAndHeightSettings.prototype.deactivate = function() {
    WidthAndHeightSettings.__super__.deactivate.call(this);
    this.unlockDrag();
    this.hidePalette();
    this.setAuxDisplay('.pm-aux__control-canvas-width', 'none');
    return this.setAuxDisplay('.pm-aux__control-canvas-height', 'none');
  };

  return WidthAndHeightSettings;

})(window.PaintMasterPlugin.tools.BaseTool);

$(document).ready(function() {
  window.painter = new window.PaintMaster({
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 500,
    height: 500,
    position: 'top'
  });
  painter.addToolboxItem(PaintMasterPlugin.tools.ClipboardImagePaste);
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawingModeSwitch);
  painter.addToolboxItem(PaintMasterPlugin.tools.Crop);
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawRect);
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawEllipse);
  painter.addToolboxItem(PaintMasterPlugin.tools.AddText);
  painter.addToolboxItem(PaintMasterPlugin.tools.WidthAndHeightSettings);
  return painter.addToolboxItem(PaintMasterPlugin.tools.DrawArrow);
});
