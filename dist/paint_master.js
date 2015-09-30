var AddCircle, AddSquare, AddText, BaseTool, ClipboardImagePaste, Crop, DrawCircle, DrawingModeSwitch, OpenSettings, PaintMaster, SelectColor, SettingsItem,
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
      canvasWidth: this.opts.width,
      canvasHeight: this.opts.height,
      fontSize: 16,
      brushSize: 5
    };
    this.fCanvas = new fabric.Canvas(this.opts.id);
    this.wrapperEl = $(this.fCanvas.wrapperEl);
    this.drawToolbox();
    this.setToolboxEventListeners();
    this.setDrawListeners();
    this.setAttributeListeners();
    this.fCanvas.setWidth(this.opts.width);
    this.fCanvas.setHeight(this.opts.height);
    this.fCanvas.setBackgroundColor('white');
    this.fCanvas.renderAll();
  }

  PaintMaster.prototype.drawToolbox = function() {
    var html;
    html = "<div class='pm-toolbox-wrapper pm-toolbox-" + this.opts.position + "'> <div class='pm-toolbox'></div> <div class='pm-block pm-current-tool hidden'> <div class='icon'> </div> <div class='desc'> <span class='pm-current-tool-name'></span> </div> <div style='clear: both'></div> </div> </div>";
    if (this.opts.position === 'top' || this.opts.position === 'left') {
      this.toolboxEl = $(html).insertBefore(this.wrapperEl).find('.pm-toolbox');
      this.currentToolNameEl = $(this.toolboxEl).parent().find('.pm-current-tool-name');
      this.currentToolEl = $(this.toolboxEl).parent().find('.pm-current-tool');
      return this.containerEl = $('.pm-toolbox-wrapper, .canvas-container').wrapAll("<div class='pm-main-container pm-main-container-" + this.opts.position + "'></div>");
    }
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
      var activeGroupObject, activeObject, j, len, ref, results;
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
              ref = self.fCanvas.getActiveGroup().objects;
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                activeGroupObject = ref[j];
                results.push(self.fCanvas.deactivateAll().remove(activeGroupObject).renderAll());
              }
              return results;
            }
          }
          break;
        case 13:
          if (self.fCanvas.getActiveObject() && self.activeTool) {
            e.preventDefault();
            return self.activeTool.onSubmit(e);
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
      results.push(this.testor(this.settings, name));
    }
    return results;
  };

  PaintMaster.prototype.settingChanged = function(name, oldVal, newVal) {
    this.activeTool.onSettingsChange();
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

  PaintMaster.prototype.testor = function(obj, propName) {
    var savedVal, self;
    self = this;
    savedVal = obj["" + propName];
    Object.defineProperty(obj, propName, {
      get: function() {
        return obj["_" + propName];
      },
      set: function(newVal) {
        self.settingChanged(propName, obj["_" + propName], newVal);
        return obj["_" + propName] = newVal;
      }
    });
    return obj["_" + propName] = savedVal;
  };

  return PaintMaster;

})();

window.PaintMasterPlugin.tools.BaseTool = BaseTool = (function() {
  function BaseTool(paintMaster) {
    this.paintMaster = paintMaster;
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
    tooltipPosition = 'top';
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
    ref = painter.fCanvas.getActiveGroup();
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      activeGroupObject = ref[j];
      results.push(this.canvas.remove(activeGroupObject));
    }
    return results;
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
      tool.deactivate();
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
    this.paintMaster.currentToolNameEl.html(this.name + "</br>");
    this.paintMaster.currentToolNameEl.after("<span>" + this.help + "</span>");
    this.paintMaster.currentToolEl.removeClass('hidden');
    return this.paintMaster.currentToolEl.find('.icon').addClass(this.id);
  };

  BaseTool.prototype.hideHelp = function() {
    this.paintMaster.currentToolNameEl.html('');
    this.paintMaster.currentToolNameEl.nextAll().remove();
    this.paintMaster.currentToolEl.addClass('hidden');
    return this.paintMaster.currentToolEl.find('.icon').removeClass(this.id);
  };

  return BaseTool;

})();

window.PaintMasterPlugin.tools.AddCircle = AddCircle = (function(superClass) {
  extend(AddCircle, superClass);

  function AddCircle(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Круг';
    this.id = 'add-circle';
    AddCircle.__super__.constructor.call(this, this.paintMaster);
  }

  AddCircle.prototype.onClick = function() {
    var circle;
    circle = new fabric.Circle({
      top: 100,
      left: 100,
      radius: 100,
      stroke: this.currentColor(),
      fill: '',
      strokeWidth: this.currentWidth()
    });
    this.paintMaster.fCanvas.add(circle);
    this.canvas.deactivateAll().renderAll();
    return this.canvas.setActiveObject(this.canvas._objects[this.canvas._objects.length - 1]);
  };

  return AddCircle;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.AddSquare = AddSquare = (function(superClass) {
  extend(AddSquare, superClass);

  function AddSquare(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Прямоугольник';
    this.id = 'add-square';
    this.active = false;
    this.canvas = this.paintMaster.fCanvas;
    AddSquare.__super__.constructor.call(this, this.paintMaster);
  }

  AddSquare.prototype.mousedown = function(e) {
    var mouse;
    this.canvas = this.paintMaster.fCanvas;
    mouse = this.canvas.getPointer();
    this.x = mouse.x;
    this.y = mouse.y;
  };

  AddSquare.prototype.mousemove = function(e) {};

  AddSquare.prototype.mouseup = function(e) {
    var currentX, currentY, height, mouse, square, width;
    if (this.canvas.getActiveObject()) {
      return;
    }
    mouse = this.canvas.getPointer();
    currentX = mouse.x;
    currentY = mouse.y;
    height = Math.abs(this.y - currentY);
    width = Math.abs(this.x - currentX);
    if (this.x > currentX) {
      this.x = currentX;
    }
    if (this.y > currentY) {
      this.y = currentY;
    }
    square = new fabric.Rect({
      width: width,
      height: height,
      left: this.x,
      top: this.y,
      fill: '',
      stroke: this.currentColor(),
      strokeWidth: this.currentWidth()
    });
    this.paintMaster.fCanvas.add(square);
    this.canvas.deactivateAll().renderAll();
    if (width > 0 || height > 0) {
      this.canvas.setActiveObject(this.canvas._objects[this.canvas._objects.length - 1]);
    }
  };

  AddSquare.prototype.onClick = function() {};

  return AddSquare;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.AddText = AddText = (function(superClass) {
  extend(AddText, superClass);

  function AddText(paintMaster) {
    this.paintMaster = paintMaster;
    this.activate = bind(this.activate, this);
    this.name = 'Текст';
    this.help = '123 Нажмите на появившееся поле чтобы редактировать текст';
    this.id = 'add-text';
    AddText.__super__.constructor.call(this, this.paintMaster);
  }

  AddText.prototype.activate = function() {
    this.iText = new fabric.IText("Tap and type", {
      fontFamily: 'arial black',
      left: 100,
      top: 100,
      fill: this.currentColor(),
      fontSize: parseInt(this.paintMaster.settings.fontSize)
    });
    this.fCanvas.add(this.iText);
    return AddText.__super__.activate.call(this);
  };

  return AddText;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.ClipboardImagePaste = ClipboardImagePaste = (function(superClass) {
  extend(ClipboardImagePaste, superClass);

  function ClipboardImagePaste(paintMaster) {
    this.paintMaster = paintMaster;
    this.name = 'Вставить картинку из буфера';
    this.help = 'Чтобы вставить картинку из буфера, нажмите CTRL-V';
    this.id = 'clipboard-image-paste';
    ClipboardImagePaste.__super__.constructor.call(this, this.paintMaster);
  }

  ClipboardImagePaste.prototype.activate = function() {
    this.setImagePasteListener();
    return ClipboardImagePaste.__super__.activate.call(this);
  };

  ClipboardImagePaste.prototype.setImagePasteListener = function() {
    var pasteImage, self;
    self = this;
    pasteImage = function(event) {
      var cbData, cbDataItem, i, imageData, imageURL, type;
      cbData = event.clipboardData;
      i = 0;
      while (i < cbData.items.length) {
        cbDataItem = cbData.items[i];
        type = cbDataItem.type;
        if (type.indexOf('image') !== -1) {
          imageData = cbDataItem.getAsFile();
          imageURL = window.webkitURL.createObjectURL(imageData);
          self.onImagePaste(imageURL);
        }
        i++;
      }
    };
    return window.addEventListener("paste", pasteImage);
  };

  ClipboardImagePaste.prototype.onImagePaste = function(imageURL) {
    var img;
    if (!this.active) {
      return;
    }
    return img = new fabric.Image.fromURL(imageURL, (function(imgFromURL) {
      return this.canvas.setBackgroundImage(imgFromURL, (function() {
        this.canvas.setHeight(imgFromURL.height);
        this.canvas.setWidth(imgFromURL.width);
        this.canvas.renderAll();
        return this.deactivate();
      }).bind(this));
    }).bind(this));
  };

  return ClipboardImagePaste;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.Crop = Crop = (function(superClass) {
  extend(Crop, superClass);

  function Crop(paintMaster) {
    this.paintMaster = paintMaster;
    this.name = 'Обрезать картинку';
    this.help = 'Выберите участок, который должен остаться </br> Enter - применить </br> Backspace - отмена';
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
      fill: ''
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
    mouse = this.canvas.getPointer();
    this.x = mouse.x;
    return this.y = mouse.y;
  };

  Crop.prototype.mousemove = function(e) {
    return this.moveBlindZones();
  };

  Crop.prototype.mouseup = function(e) {
    var mouse;
    mouse = this.canvas.getPointer();
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
    this.canvas.setWidth(width * scaleX);
    this.canvas.setHeight(height * scaleY);
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

window.PaintMasterPlugin.tools.DrawCircle = DrawCircle = (function(superClass) {
  extend(DrawCircle, superClass);

  function DrawCircle(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Окружность';
    this.id = 'draw-circle';
    DrawCircle.__super__.constructor.call(this, this.paintMaster);
  }

  DrawCircle.prototype.onClick = function() {
    return;
    if (this.active === true) {
      return this.paintMaster.wrapperEl.find(".pm-tool." + this.id).addClass('active');
    } else {
      return this.paintMaster.wrapperEl.find(".pm-tool." + this.id).removeClass('active');
    }
  };

  DrawCircle.prototype.mousedown = function(e) {
    var mouse;
    this.canvas = this.paintMaster.fCanvas;
    mouse = this.canvas.getPointer();
    this.x = mouse.x;
    return this.y = mouse.y;
  };

  DrawCircle.prototype.mousemove = function(e) {
    return 1;
  };

  DrawCircle.prototype.mouseup = function(e) {
    var mouse;
    if (this.canvas.getActiveObject()) {
      return;
    }
    this.canvas = this.paintMaster.fCanvas;
    mouse = this.canvas.getPointer();
    return this.addCircleToCanvas(this.x, this.y, mouse.x, mouse.y);
  };

  DrawCircle.prototype.addCircleToCanvas = function(startX, startY, currentX, currentY) {
    var circle, rx, ry;
    rx = Math.abs(currentX - startX) / 2;
    ry = Math.abs(currentY - startY) / 2;
    if (startX > currentX) {
      startX = currentX;
    }
    if (startY > currentY) {
      startY = currentY;
    }
    circle = new fabric.Ellipse({
      top: startY,
      left: startX,
      rx: rx,
      ry: ry,
      stroke: this.currentColor(),
      fill: '',
      strokeWidth: this.currentWidth()
    });
    this.canvas.add(circle);
    this.canvas.deactivateAll().renderAll();
    if (rx > 0 || ry > 0) {
      return this.canvas.setActiveObject(this.canvas._objects[this.canvas._objects.length - 1]);
    }
  };

  return DrawCircle;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawingModeSwitch = DrawingModeSwitch = (function(superClass) {
  extend(DrawingModeSwitch, superClass);

  function DrawingModeSwitch(paintMaster) {
    this.paintMaster = paintMaster;
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
    return this.paintMaster.fCanvas.isDrawingMode = this.active;
  };

  DrawingModeSwitch.prototype.deactivate = function() {
    DrawingModeSwitch.__super__.deactivate.call(this);
    return this.paintMaster.fCanvas.isDrawingMode = this.active;
  };

  return DrawingModeSwitch;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.SettingsItem = SettingsItem = (function() {
  function SettingsItem(paintMaster, params1) {
    this.paintMaster = paintMaster;
    this.params = params1;
    return;
  }

  SettingsItem.prototype.render = function() {
    return "<div class='pm-settings-element'> <label> " + this.params.label + ": </label> <span class='pm-settings-value " + this.params.cssClass + "'> " + this.paintMaster.settings[this.params.pmAttr] + " </span> <span class='pm-settings-input-container'> " + this.params.htmlInput + " </span> </div>";
  };

  SettingsItem.prototype.setCallbacks = function() {
    var callback, j, len, ref, results;
    ref = this.params.callbacks;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      callback = ref[j];
      results.push(callback.call(this.paintMaster));
    }
    return results;
  };

  return SettingsItem;

})();

window.PaintMasterPlugin.tools.OpenSettings = OpenSettings = (function(superClass) {
  extend(OpenSettings, superClass);

  function OpenSettings(paintMaster) {
    this.paintMaster = paintMaster;
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
    return this.setSettingsCallbacks();
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

  OpenSettings.prototype.getSettingsItems = function() {
    var brushSizeItem, canvasHeightItem, canvasWidthItem, defaultSettingsItems, fontSizeItem;
    if (defaultSettingsItems) {
      return defaultSettingsItems;
    }
    defaultSettingsItems = [];
    fontSizeItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Font size',
      cssClass: 'pm-font-size-value',
      pmAttr: 'fontSize',
      htmlInput: "<input type='range' min='1' max='100' class='pm-font-size' value='" + (parseInt(this.paintMaster.settings.fontSize)) + "'>",
      callbacks: [
        (function() {
          var self;
          self = this;
          return $(this.containerEl).on('input', '.pm-font-size', function(e) {
            self.settings.fontSize = e.currentTarget.valueAsNumber + 'px';
            return $('span.pm-font-size-value').html(self.settings.fontSize);
          });
        })
      ]
    });
    brushSizeItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Brush size',
      cssClass: 'pm-brush-size-value',
      pmAttr: 'brushSize',
      htmlInput: "<input type='range' min='1' max='100' class='pm-brush-size' value='" + (parseInt(this.paintMaster.settings.brushSize)) + "'>",
      callbacks: [
        (function() {
          var self;
          self = this;
          return $(this.containerEl).on('input', '.pm-brush-size', function(e) {
            self.settings.brushSize = e.currentTarget.valueAsNumber + 'px';
            return $('span.pm-brush-size-value').html(self.settings.brushSize);
          });
        })
      ]
    });
    canvasWidthItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Canvas width',
      cssClass: 'pm-canvas-width-value',
      pmAttr: 'canvasWidth',
      htmlInput: "<input type='range' min='1' max='1000' class='pm-canvas-width' value='" + (parseInt(this.paintMaster.settings.canvasWidth)) + "'>",
      callbacks: [
        (function() {
          var self;
          self = this;
          return $(this.containerEl).on('input', '.pm-canvas-width', function(e) {
            self.settings.canvasWidth = e.currentTarget.valueAsNumber + 'px';
            return $('span.pm-canvas-width-value').html(self.settings.canvasWidth);
          });
        })
      ]
    });
    canvasHeightItem = new PaintMasterPlugin.SettingsItem(this.paintMaster, {
      label: 'Canvas height',
      cssClass: 'pm-canvas-height-value',
      pmAttr: 'canvasWidth',
      htmlInput: "<input type='range' min='1' max='1000' class='pm-canvas-height' value='" + (parseInt(this.paintMaster.settings.canvasHeight)) + "'>",
      callbacks: [
        (function() {
          var self;
          self = this;
          return $(this.containerEl).on('input', '.pm-canvas-height', function(e) {
            self.settings.canvasHeight = e.currentTarget.valueAsNumber + 'px';
            return $('span.pm-canvas-height-value').html(self.settings.canvasHeight);
          });
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

  function SelectColor(paintMaster) {
    this.paintMaster = paintMaster;
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

$(document).ready(function() {
  window.painter = new window.PaintMaster({
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme',
    width: 500,
    height: 500,
    position: 'left'
  });
  painter.addToolboxItem(PaintMasterPlugin.tools.ClipboardImagePaste);
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawingModeSwitch);
  painter.addToolboxItem(PaintMasterPlugin.tools.Crop);
  painter.addToolboxItem(PaintMasterPlugin.tools.AddSquare);
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawCircle);
  painter.addToolboxItem(PaintMasterPlugin.tools.AddText);
  painter.addToolboxItem(PaintMasterPlugin.tools.SelectColor);
  return painter.addToolboxItem(PaintMasterPlugin.tools.OpenSettings);
});
