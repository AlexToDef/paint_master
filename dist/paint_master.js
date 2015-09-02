var AcceptCrop, AddCircle, AddSquare, AddText, BaseTool, ClipboardImagePaste, Crop, DrawCircle, DrawingModeSwitch, OpenSettings, PaintMaster, SelectColor,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

window.PaintMasterPlugin = {};

window.PaintMasterPlugin.tools = {};

window.PaintMasterPlugin.PaintMaster = PaintMaster = (function() {
  function PaintMaster(opts) {
    this.opts = opts;
    this.toolbox = {};
    this.fCanvas = new fabric.Canvas(this.opts.id);
    this.wrapperEl = $(this.fCanvas.wrapperEl);
    this.drawToolbox();
    this.setToolboxEventListeners();
    this.setDrawListeners();
    this.fCanvas.setWidth(this.opts.width);
    this.fCanvas.setHeight(this.opts.height);
  }

  PaintMaster.prototype.drawToolbox = function() {
    var html;
    console.log('drawToolbox');
    console.log(this.wrapperEl);
    html = "<div class='pm-toolbox pm-toolbox-bottom'></div>";
    return this.toolboxEl = $(html).appendTo(this.wrapperEl);
  };

  PaintMaster.prototype.setToolboxEventListeners = function() {
    var onKeyDownHandler, self;
    self = this;
    $(this.wrapperEl).on('click', '.pm-toolbox .pm-tool', function(e) {
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
    $(this.wrapperEl).on('change', 'input', function(e) {
      var toolId;
      toolId = $(this).parent().data('pmToolId');
      return self.toolbox[toolId].onChange(e);
    });
    onKeyDownHandler = function(e) {
      var activeObject;
      switch (e.keyCode) {
        case 46:
          e.preventDefault();
          activeObject = self.fCanvas.getActiveObject();
          return self.fCanvas.remove(activeObject);
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

  return PaintMaster;

})();

window.PaintMasterPlugin.tools.BaseTool = BaseTool = (function() {
  function BaseTool(paintMaster) {
    this.paintMaster = paintMaster;
    this.deactivate = bind(this.deactivate, this);
    this.activate = bind(this.activate, this);
    this.currentWidth = bind(this.currentWidth, this);
    this.currentColor = bind(this.currentColor, this);
    this.onChange = bind(this.onChange, this);
    this.fCanvas = this.paintMaster.fCanvas;
    this.canvas = this.fCanvas;
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'></div>";
    this.active = false;
  }

  BaseTool.prototype.onChange = function(e) {
    return 1;
  };

  BaseTool.prototype.onClick = function(e) {};

  BaseTool.prototype.onRemove = function() {
    console.log('onRemove');
    return this.paintMaster.wrapperEl.find(".pm-tool." + this.id).remove();
  };

  BaseTool.prototype.currentColor = function() {
    return this.paintMaster.selectedColor || 'red';
  };

  BaseTool.prototype.currentWidth = function() {
    return this.paintMaster.selectedWidth || 5;
  };

  BaseTool.prototype.activate = function() {
    var key, ref, tool;
    ref = this.paintMaster.toolbox;
    for (key in ref) {
      tool = ref[key];
      tool.deactivate();
    }
    $(".pm-tool." + this.id).addClass('active');
    return this.active = true;
  };

  BaseTool.prototype.deactivate = function() {
    $(".pm-tool." + this.id).removeClass('active');
    return this.active = false;
  };

  BaseTool.prototype.mousedown = function(e) {};

  BaseTool.prototype.mousemove = function(e) {};

  BaseTool.prototype.mouseup = function(e) {};

  return BaseTool;

})();

window.PaintMasterPlugin.tools.AddCircle = AddCircle = (function(superClass) {
  extend(AddCircle, superClass);

  function AddCircle(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Add Circle';
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
    return this.paintMaster.fCanvas.add(circle);
  };

  return AddCircle;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.AddSquare = AddSquare = (function(superClass) {
  extend(AddSquare, superClass);

  function AddSquare(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Add Square';
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
  };

  AddSquare.prototype.onClick = function() {};

  return AddSquare;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.AddText = AddText = (function(superClass) {
  extend(AddText, superClass);

  function AddText(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Add Text';
    this.id = 'add-text';
    AddText.__super__.constructor.call(this, this.paintMaster);
  }

  AddText.prototype.onClick = function() {
    var rect;
    rect = new fabric.IText("Tap and type", {
      fontFamily: 'arial black',
      left: 100,
      top: 100,
      fill: this.currentColor()
    });
    return this.paintMaster.fCanvas.add(rect);
  };

  return AddText;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.ClipboardImagePaste = ClipboardImagePaste = (function(superClass) {
  extend(ClipboardImagePaste, superClass);

  function ClipboardImagePaste(paintMaster) {
    this.paintMaster = paintMaster;
    this.name = 'ClipboardImagePaste';
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

window.PaintMasterPlugin.tools.AcceptCrop = AcceptCrop = (function(superClass) {
  extend(AcceptCrop, superClass);

  function AcceptCrop(paintMaster) {
    this.paintMaster = paintMaster;
    this.name = 'Accept Crop';
    this.id = 'accept-crop';
    this.canvas = this.paintMaster.fCanvas;
    AcceptCrop.__super__.constructor.call(this, this.paintMaster);
  }

  AcceptCrop.prototype.activate = function() {
    var ctx, height, img, left, scaleX, scaleY, top, width;
    this.trueSight = this.canvas._objects[this.canvas._objects.length - 1];
    width = this.trueSight.width;
    height = this.trueSight.height;
    left = this.trueSight.left;
    top = this.trueSight.top;
    scaleX = this.trueSight.scaleX;
    scaleY = this.trueSight.scaleY;
    ctx = this.canvas.contextTop || this.canvas.contextContainer;
    console.log(width);
    console.log(scaleX);
    console.log(width * scaleX);
    img = this.canvas.toDataURL({
      format: 'png',
      left: left,
      top: top,
      width: width * scaleX,
      height: height * scaleY,
      crossOrigin: 'anonymous'
    });
    this.canvas.clear().renderAll();
    this.canvas.setWidth(width * scaleX);
    this.canvas.setHeight(height * scaleY);
    this.canvas.setBackgroundImage(img, (function() {
      return this.renderAll();
    }).bind(this.canvas));
    AcceptCrop.__super__.activate.call(this);
    return this.deactivate();
  };

  return AcceptCrop;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.Crop = Crop = (function(superClass) {
  extend(Crop, superClass);

  function Crop(paintMaster) {
    this.paintMaster = paintMaster;
    this.name = 'Crop';
    this.id = 'crop';
    this.canvas = this.paintMaster.fCanvas;
    this.shadeFill = '5E5E5E';
    this.shadeOpacity = 0.7;
    Crop.__super__.constructor.call(this, this.paintMaster);
  }

  Crop.prototype.activate = function() {
    Crop.__super__.activate.call(this);
    this.paintMaster.addToolboxItem(PaintMasterPlugin.tools.AcceptCrop);
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
    this.addBlindZones();
    return this.canvas.moveTo(this.trueSight, this.canvas._objects.length);
  };

  Crop.prototype.deactivate = function() {
    Crop.__super__.deactivate.call(this);
    console.log(this.paintMaster.toolbox['accept-crop']);
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
      height: this.canvas.height,
      width: this.canvas.width - xy,
      left: xy,
      top: yy
    });
    return this.bottomBlindZone = this.addBlindZone({
      height: this.canvas.height,
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

  return Crop;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawCircle = DrawCircle = (function(superClass) {
  extend(DrawCircle, superClass);

  function DrawCircle(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Draw Circle';
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
    return this.canvas.add(circle);
  };

  return DrawCircle;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.DrawingModeSwitch = DrawingModeSwitch = (function(superClass) {
  extend(DrawingModeSwitch, superClass);

  function DrawingModeSwitch(paintMaster) {
    this.paintMaster = paintMaster;
    this.onClick = bind(this.onClick, this);
    this.name = 'Drawing Mode Switch';
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

window.PaintMasterPlugin.tools.OpenSettings = OpenSettings = (function(superClass) {
  extend(OpenSettings, superClass);

  function OpenSettings(paintMaster) {
    this.paintMaster = paintMaster;
    this.onChange = bind(this.onChange, this);
    this.onClick = bind(this.onClick, this);
    this.name = 'Open Settings';
    this.id = 'open-settings';
    OpenSettings.__super__.constructor.call(this, this.paintMaster);
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'> </div>";
  }

  OpenSettings.prototype.onClick = function(e) {
    return 1;
  };

  OpenSettings.prototype.onChange = function(e) {
    this.paintMaster.selectedColor = e.currentTarget.value;
    this.paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value;
    return this.paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value);
  };

  return OpenSettings;

})(window.PaintMasterPlugin.tools.BaseTool);

window.PaintMasterPlugin.tools.SelectColor = SelectColor = (function(superClass) {
  extend(SelectColor, superClass);

  function SelectColor(paintMaster) {
    this.paintMaster = paintMaster;
    this.onChange = bind(this.onChange, this);
    this.onClick = bind(this.onClick, this);
    this.name = 'SelectColor';
    this.id = 'select-color';
    SelectColor.__super__.constructor.call(this, this.paintMaster);
    this.html = "<div class='pm-tool " + this.id + "' data-pm-tool-id='" + this.id + "'> <input type='color' class='pm-colorpicker' /> </div>";
  }

  SelectColor.prototype.onClick = function(e) {
    return 1;
  };

  SelectColor.prototype.onChange = function(e) {
    this.paintMaster.selectedColor = e.currentTarget.value;
    this.paintMaster.fCanvas.freeDrawingBrush.color = e.currentTarget.value;
    return this.paintMaster.wrapperEl.find('.pm-tool.select-color').css('color', e.currentTarget.value);
  };

  return SelectColor;

})(window.PaintMasterPlugin.tools.BaseTool);

$(document).ready(function() {
  window.painter = new window.PaintMaster({
    applyOnImage: true,
    backgroundUrl: $('img').attr('src'),
    id: 'testme'
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
