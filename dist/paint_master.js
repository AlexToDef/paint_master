var AddText, BaseSetting, BaseTool, BrushSize, CanvasHeight, CanvasWidth, ClipboardBackgroundPaste, ClipboardImagePaste, Color, Crop, DrawArrow, DrawEllipse, DrawRect, DrawingModeSwitch, FontSize, OpenSettings, PaintMaster, SelectionModeSwitch, SettingsItem, WidthAndHeightSettings, keydown, onPressBackspace, onPressEnter, onPressEscape, setAttributeWatchers, strSVG, switchActiveElementLock, switchActiveGroupLock, switchElementLock,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.PaintMasterPlugin = {};

window.PaintMasterPlugin.tools = {};

window.PaintMasterPlugin.modules = {};

window.PaintMasterPlugin.settings = {};

setAttributeWatchers = function(paintMaster, collection, propName) {
  var savedVal;
  savedVal = collection[propName];
  if (("" + propName) !== 'test') {
    collection["_" + propName] = savedVal;
    return Object.defineProperty(collection, propName, {
      get: function() {
        return collection["_" + propName];
      },
      set: function(newVal) {
        var event, oldVal;
        oldVal = collection["_" + propName];
        collection["_" + propName] = newVal;
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
  }
};

window.PaintMasterPlugin.modules.AttributeEvents = {
  setWatchersOnCollection: function(paintMaster, collection) {
    var name, oldVal, results;
    results = [];
    for (name in collection) {
      oldVal = collection[name];
      results.push(setAttributeWatchers(paintMaster, collection, name));
    }
    return results;
  },
  setWatcherOnCollectionElement: function(paintMaster, collection, propName) {
    var savedVal;
    savedVal = collection[propName];
    if (("" + propName) !== 'test') {
      collection["_" + propName] = savedVal;
      return Object.defineProperty(collection, propName, {
        get: function() {
          return collection["_" + propName];
        },
        set: function(newVal) {
          var event, oldVal;
          oldVal = collection["_" + propName];
          collection["_" + propName] = newVal;
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
    }
  }
};

switchActiveElementLock = function(canvas) {
  this.switchElementLock(canvas.getActiveObject());
  return canvas.renderAll();
};

switchElementLock = function(element) {
  element.lockMovementX = !element.lockMovementX;
  element.lockMovementY = !element.lockMovementY;
  element.lockScalingY = !element.lockScalingY;
  element.lockScalingX = !element.lockScalingX;
  element.cornerColor = element.lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
  return element.borderColor = element.lockMovementX ? 'rgba(150,0,0,0.5)' : 'rgba(102,153,255,0.5)';
};

switchActiveGroupLock = function(canvas) {
  var activeGroupObject, j, len, ref;
  ref = canvas.getActiveGroup().objects;
  for (j = 0, len = ref.length; j < len; j++) {
    activeGroupObject = ref[j];
    this.switchElementLock(activeGroupObject);
  }
  return canvas.renderAll();
};

window.PaintMasterPlugin.modules.CanvasElements = {
  switchActiveElementLock: switchActiveElementLock,
  switchElementLock: switchElementLock,
  switchActiveGroupLock: switchActiveGroupLock
};

onPressEnter = function(e, paintMaster) {
  var canvas;
  canvas = paintMaster.canvas;
  if (canvas.getActiveObject() && paintMaster.activeTool) {
    e.preventDefault();
    paintMaster.activeTool.onSubmit(e);
  }
  if (canvas.getActiveObject()) {
    switchActiveElementLock(canvas);
  }
  if (canvas.getActiveGroup()) {
    return switchActiveGroupLock();
  }
};

onPressEscape = function(paintMaster) {
  paintMaster.canvas.deactivateAll().renderAll();
  if (paintMaster.activeTool) {
    return paintMaster.activeTool.deactivate();
  }
};

onPressBackspace = function(e, paintMaster) {
  var activeGroupObject, activeObject, canvas, j, len, ref, results;
  canvas = paintMaster.canvas;
  if (canvas.getActiveObject() || canvas.getActiveGroup()) {
    e.preventDefault();
    if (paintMaster.activeTool) {
      return paintMaster.activeTool.onBackspace(e);
    } else {
      activeObject = canvas.getActiveObject();
      canvas.remove(activeObject);
      if (canvas.getActiveGroup()) {
        ref = canvas.getActiveGroup().objects;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          activeGroupObject = ref[j];
          results.push(canvas.deactivateAll().remove(activeGroupObject).renderAll());
        }
        return results;
      }
    }
  }
};

keydown = {
  27: function(event, paintMaster) {
    return onPressEscape(paintMaster);
  },
  13: function(event, paintMaster) {
    return onPressEnter(event, paintMaster);
  },
  46: function(event, paintMaster) {
    return onPressBackspace(event, paintMaster);
  },
  8: function(event, paintMaster) {
    return onPressBackspace(event, paintMaster);
  }
};

window.PaintMasterPlugin.modules.EventsListeners = {
  keydown: keydown
};

window.PaintMasterPlugin.PaintMaster = PaintMaster = (function() {
  function PaintMaster(opts) {
    this.opts = opts;
    this.importModule('CanvasElements');
    this.importModule('EventsListeners');
    this.importModule('AttributeEvents');
    this.toolbox = {};
    this.settings = {
      test: 1
    };
    this.fCanvas = new fabric.Canvas(this.opts.id);
    this.fCanvas.freeDrawingBrush.color = this.settings.color;
    this.fCanvas.freeDrawingBrush.width = this.settings.brushSize;
    this.fCanvas.setWidth(this.settings.canvasWidth);
    this.fCanvas.setHeight(this.settings.canvasHeight);
    this.fCanvas.setBackgroundColor('white');
    this.fCanvas.renderAll();
    this.canvas = this.fCanvas;
    this.canvasWrapper = $(this.fCanvas.wrapperEl);
    $(this.canvasWrapper).wrapAll("<div class='pm-container'></div>");
    this.wrapper = this.canvasWrapper.parent();
    this.drawToolbox();
    this.setToolboxEventListeners();
    this.setDrawListeners();
    this.setWatchersOnCollection(this, this.settings);
  }

  PaintMaster.prototype.importModule = function(moduleName) {
    var method, name, ref, results;
    ref = window.PaintMasterPlugin.modules[moduleName];
    results = [];
    for (name in ref) {
      method = ref[name];
      results.push(this[name] = method);
    }
    return results;
  };

  PaintMaster.prototype.drawToolbox = function() {
    var pmBarTop;
    pmBarTop = "<div class='pm-bar pm-bar_top'> <div class='pm-toolbox'></div> <div class='pm-settings'></div> </div>";
    this.topBar = $(pmBarTop).prependTo(this.wrapper);
    this.bottomBar = $("<div class='pm-bar pm-bar--bottom'><div class='pm-toolbox'></div></div>").appendTo(this.wrapper);
    return this.containerEl = $('.canvas-container');
  };

  PaintMaster.prototype.setToolboxEventListeners = function() {
    var self;
    self = this;
    $(this.wrapper).on('click', '.pm-toolbox .pm-toolbox__tool', function(e) {
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
    $(this.wrapper).on('change', 'input', function(e) {
      var toolId;
      toolId = $(this).parent().data('pmToolId');
      if (toolId) {
        return self.toolbox[toolId].onChange(e);
      }
    });
    $(this.wrapper).on('mouseover', '.pm-tool', function(e) {
      var toolId;
      toolId = $(this).data('pmToolId');
      return self.toolbox[toolId].onMouseover(e);
    });
    $(this.wrapper).on('mouseleave', '.pm-tool', function(e) {
      var toolId;
      toolId = $(this).data('pmToolId');
      return self.toolbox[toolId].onMouseleave(e);
    });
    return $(window).on('keydown', function(e) {
      var handler;
      console.log(e.keyCode);
      handler = self.keydown[e.keyCode];
      if (handler) {
        return handler(e, self);
      }
    });
  };

  PaintMaster.prototype.setDrawListeners = function() {
    this.canvas.observe('mouse:down', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mousedown(e);
        }
      };
    })(this));
    this.canvas.observe('mouse:move', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mousemove(e);
        }
      };
    })(this));
    return this.canvas.observe('mouse:up', (function(_this) {
      return function(e) {
        if (_this.activeTool && _this.activeTool.active) {
          return _this.activeTool.mouseup(e);
        }
      };
    })(this));
  };

  PaintMaster.prototype.addToolboxItem = function(item, bar) {
    item = new item(this);
    if (bar === 'top') {
      $(this.topBar).find('.pm-toolbox').append(item.html);
    }
    if (bar === 'bottom') {
      $(this.bottomBar).find('.pm-toolbox').append(item.html);
    }
    return this.toolbox[item.id] = item;
  };

  PaintMaster.prototype.addSettingsItem = function(item, bar) {
    item = new window.PaintMasterPlugin.settings[item](this);
    if (bar === 'top') {
      $(this.topBar).find('.pm-settings').append(item.html);
    }
    item.included();
    item.registerCallbacks();
    return this.setWatcherOnCollectionElement(this, this.settings, item.attributeName);
  };

  PaintMaster.prototype.addAdditionalToolboxItem = function(item) {
    item = new item(this);
    this.additionalToolboxEl.append(item.html);
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

  PaintMaster.prototype.drawAdditionalToolbox = function() {
    var html;
    html = "<div class='pm-additional-toolbox'></div>";
    return this.additionalToolboxEl = $(html).appendTo('.pm-main-container');
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

window.PaintMasterPlugin.settings.BaseSetting = BaseSetting = (function() {
  function BaseSetting(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.html = makeHTML();
    this.minVal = 1;
    this.maxVal = 1000;
  }

  BaseSetting.prototype.included = function() {
    return this.paintMaster.settings[this.attributeName] = this.initialValue;
  };

  BaseSetting.prototype.registerCallbacks = function() {};

  BaseSetting.prototype.makeHTML = function() {
    return "<div class='pm-settings__item' data-pm-settings-attr='" + this.attributeName + "'> <label> " + this.humanName + ": <span>" + this.initialValue + "</span> </label> <input type='range' min='" + this.minVal + "' max='" + this.maxVal + "' value='" + this.initialValue + "'> </div>";
  };

  return BaseSetting;

})();

window.PaintMasterPlugin.settings.BrushSize = BrushSize = (function(superClass) {
  extend(BrushSize, superClass);

  function BrushSize(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.attributeName = 'brushSize';
    this.humanName = 'Размер кисти';
    this.minVal = 1;
    this.maxVal = 64;
    this.initialValue = 8;
    this.html = this.makeHTML();
  }

  BrushSize.prototype.included = function() {
    BrushSize.__super__.included.call(this);
    return this.paintMaster.canvas.freeDrawingBrush.width = this.initialValue;
  };

  BrushSize.prototype.registerCallbacks = function() {
    var paintMaster, self;
    self = this;
    paintMaster = this.paintMaster;
    $(document).on('pmSettingsChange', function(e) {
      var value;
      if (e.originalEvent.detail.property === 'brushSize') {
        value = e.originalEvent.detail.newVal;
        paintMaster.canvas.freeDrawingBrush.width = value;
        $('.pm-settings__item[data-pm-settings-attr="brushSize"] label span').html(value);
        $('.pm-settings__item[data-pm-settings-attr="brushSize"] input').html(value);
        return localStorage['pmAttr[brushSize]'] = value;
      }
    });
    return $(document).on('input', '.pm-settings__item[data-pm-settings-attr="brushSize"] input', function(e) {
      console.log(23);
      return self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber;
    });
  };

  return BrushSize;

})(BaseSetting);

window.PaintMasterPlugin.settings.CanvasHeight = CanvasHeight = (function(superClass) {
  extend(CanvasHeight, superClass);

  function CanvasHeight(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.attributeName = 'canvasHeight';
    this.humanName = 'Высота xолста';
    this.initialValue = localStorage['pmAttr[canvasHeight]'] || 500;
    this.html = this.makeHTML();
  }

  CanvasHeight.prototype.included = function() {
    CanvasHeight.__super__.included.call(this);
    return this.paintMaster.canvas.setHeight(this.initialValue);
  };

  CanvasHeight.prototype.registerCallbacks = function() {
    var paintMaster, self;
    self = this;
    paintMaster = this.paintMaster;
    $(document).on('pmSettingsChange', function(e) {
      var value;
      if (e.originalEvent.detail.property === 'canvasHeight') {
        value = e.originalEvent.detail.newVal;
        paintMaster.canvas.setHeight(value);
        $('.pm-settings__item[data-pm-settings-attr="canvasHeight"] label span').html(value);
        localStorage['pmAttr[canvasHeight]'] = value;
        return $('.pm-settings__item[data-pm-settings-attr="canvasHeight"] input').val(value);
      }
    });
    return $(document).on('input', '.pm-settings__item[data-pm-settings-attr="canvasHeight"]', function(e) {
      return self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber;
    });
  };

  CanvasHeight.prototype.makeHTML = function() {
    return "<div class='pm-settings__item' data-pm-settings-attr='canvasHeight'> <label> " + this.humanName + ": </label> <input type='number' min='1' max='4000' value='" + this.initialValue + "'> </div>";
  };

  return CanvasHeight;

})(BaseSetting);

window.PaintMasterPlugin.settings.CanvasWidth = CanvasWidth = (function(superClass) {
  extend(CanvasWidth, superClass);

  function CanvasWidth(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.attributeName = 'canvasWidth';
    this.humanName = 'Ширина xолста';
    this.initialValue = (localStorage['pmAttr[canvasWidth]'] || this.opts.width) || 500;
    this.html = this.makeHTML();
  }

  CanvasWidth.prototype.included = function() {
    CanvasWidth.__super__.included.call(this);
    return this.paintMaster.canvas.setWidth(this.initialValue);
  };

  CanvasWidth.prototype.registerCallbacks = function() {
    var paintMaster, self;
    self = this;
    paintMaster = this.paintMaster;
    $(document).on('pmSettingsChange', function(e) {
      var value;
      if (e.originalEvent.detail.property === 'canvasWidth') {
        value = e.originalEvent.detail.newVal;
        paintMaster.canvas.setWidth(value);
        $('.pm-settings__item[data-pm-settings-attr="canvasWidth"] label span').html(value);
        localStorage['pmAttr[canvasWidth]'] = value;
        return $('.pm-settings__item[data-pm-settings-attr="canvasWidth"] input').val(value);
      }
    });
    return $(document).on('input', '.pm-settings__item[data-pm-settings-attr="canvasWidth"]', function(e) {
      return self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber;
    });
  };

  CanvasWidth.prototype.makeHTML = function() {
    return "<div class='pm-settings__item' data-pm-settings-attr='canvasWidth'> <label> Ширина холста: </label> <input type='number' min='1' max='4000' value='" + this.initialValue + "'> </div>";
  };

  return CanvasWidth;

})(BaseSetting);

window.PaintMasterPlugin.settings.Color = Color = (function(superClass) {
  extend(Color, superClass);

  function Color(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.attributeName = 'color';
    this.initialValue = localStorage['pmAttr[color]'] || '#ff421f';
    this.colors = ['#ff421f', '#00e535', '#000000', '#ff4f81', '#fff24d', '#0096e7', '#919191', '#ffffff'];
    this.html = this.makeHTML();
  }

  Color.prototype.included = function() {
    Color.__super__.included.call(this);
    return this.paintMaster.canvas.freeDrawingBrush.color = this.initialValue;
  };

  Color.prototype.registerCallbacks = function() {
    var paintMaster, self;
    self = this;
    paintMaster = this.paintMaster;
    $(document).on('pmSettingsChange', function(e) {
      var color;
      if (e.originalEvent.detail.property === 'color') {
        color = e.originalEvent.detail.newVal;
        paintMaster.canvas.freeDrawingBrush.color = color;
        localStorage['pmAttr[color]'] = color;
        $(paintMaster.wrapper).find(".pm-settings__palette-item").removeClass('pm-settings__palette-item--active');
        return $(paintMaster.wrapper).find("[data-color='" + color + "']").parent().addClass('pm-settings__palette-item--active');
      }
    });
    return $(paintMaster.wrapper).on('click', '.pm-settings__palette .pm-settings__palette-item', function(e) {
      return self.paintMaster.settings[self.attributeName] = $(e.currentTarget).find('div').data('color');
    });
  };

  Color.prototype.makeHTML = function() {
    var color;
    return "<div class='pm-settings__palette' data-pm-settings-attr='" + this.attributeName + "'> " + (((function() {
      var j, len, ref, results;
      ref = this.colors;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        color = ref[j];
        results.push(this.renderColorItem(color));
      }
      return results;
    }).call(this)).join('')) + " </div>";
  };

  Color.prototype.renderColorItem = function(color) {
    return "<div class='pm-settings__palette-item " + (this.initialValue === color ? 'pm-settings__palette-item--active' : '') + "'> <div style='background-color: " + color + "' data-color='" + color + "'> </div> </div>";
  };

  return Color;

})(BaseSetting);

window.PaintMasterPlugin.settings.FontSize = FontSize = (function(superClass) {
  extend(FontSize, superClass);

  function FontSize(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.attributeName = 'fontSize';
    this.humanName = 'Размер шрифта';
    this.minVal = 1;
    this.maxVal = 64;
    this.initialValue = 14;
    this.html = this.makeHTML();
  }

  FontSize.prototype.included = function() {
    FontSize.__super__.included.call(this);
    return this.paintMaster.canvas.freeDrawingBrush.width = this.initialValue;
  };

  FontSize.prototype.registerCallbacks = function() {
    var paintMaster, self;
    self = this;
    paintMaster = this.paintMaster;
    $(document).on('pmSettingsChange', function(e) {
      var value;
      if (e.originalEvent.detail.property === 'fontSize') {
        value = e.originalEvent.detail.newVal;
        $('.pm-settings__item[data-pm-settings-attr="fontSize"] label span').html(value);
        $('.pm-settings__item[data-pm-settings-attr="fontSize"] input').html(value);
        return localStorage['pmAttr[fontSize]'] = value;
      }
    });
    return $(document).on('input', '.pm-settings__item[data-pm-settings-attr="fontSize"] input', function(e) {
      return self.paintMaster.settings[self.attributeName] = e.target.valueAsNumber;
    });
  };

  return FontSize;

})(BaseSetting);

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
    this.html = "<div class='pm-toolbox__tool " + this.id + "' data-pm-tool-id='" + this.id + "'></div>";
    this.active = false;
    this.help || (this.help = '');
  }

  BaseTool.prototype.onChange = function(e) {
    return 1;
  };

  BaseTool.prototype.onClick = function(e) {};

  BaseTool.prototype.onRemove = function() {
    return this.paintMaster.wrapper.find(".pm-toolbox__tool." + this.id).remove();
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
    $(".pm-toolbox__tool." + this.id).addClass('pm-toolbox__tool_active');
    this.displayHelp();
    return this.active = true;
  };

  BaseTool.prototype.deactivate = function() {
    $(".pm-toolbox__tool." + this.id).removeClass('pm-toolbox__tool_active');
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

  BaseTool.prototype.displaySettings = function(settingsName) {
    var i, name, results;
    results = [];
    for (i in settingsName) {
      name = settingsName[i];
      results.push($("[data-pm-settings-attr='" + name + "']").show());
    }
    return results;
  };

  BaseTool.prototype.hideSettings = function(settingsName) {
    var i, name, results;
    results = [];
    for (i in settingsName) {
      name = settingsName[i];
      results.push($("[data-pm-settings-attr='" + name + "']").hide());
    }
    return results;
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
    return AddText.__super__.activate.call(this);
  };

  AddText.prototype.deactivate = function() {
    return AddText.__super__.deactivate.call(this);
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
    this.pasteElem = $(html).appendTo(this.paintMaster.containerEl);
    this.helpElem = $(helpHtml).appendTo($(this.paintMaster.containerEl));
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
      if (this.resize) {
        imgInstance.selectable = false;
      }
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
    console.log('onSubmit');
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
    this.id = 'draw-arrow';
    this.active = false;
    this.canvas = this.paintMaster.fCanvas;
    DrawArrow.__super__.constructor.call(this, this.paintMaster);
  }

  DrawArrow.prototype.activate = function() {
    DrawArrow.__super__.activate.call(this);
    this.lockDrag();
    return this.displaySettings(['color', 'brushSize']);
  };

  DrawArrow.prototype.deactivate = function() {
    DrawArrow.__super__.deactivate.call(this);
    this.unlockDrag();
    return this.hideSettings(['color', 'brushSize']);
  };

  DrawArrow.prototype.mousedown = function(e) {
    var self;
    this.canvas.deactivateAll();
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
    arrow = this.canvas.getActiveObject();
    mouse = this.canvas.getPointer(e.e);
    currentX = mouse.x;
    currentY = mouse.y;
    deltaY = currentY - this.initialMouse.y;
    deltaX = currentX - this.initialMouse.x;
    angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI - 90;
    distance = Math.sqrt(Math.abs(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));
    deltaHeight = this.initialHeight - distance;
    proption = Math.abs(distance / this.initialHeight);
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
    return this.displaySettings(['color', 'brushSize']);
  };

  DrawEllipse.prototype.deactivate = function() {
    DrawEllipse.__super__.deactivate.call(this);
    return this.hideSettings(['color', 'brushSize']);
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
    return this.displaySettings(['color', 'brushSize']);
  };

  DrawRect.prototype.deactivate = function() {
    DrawRect.__super__.deactivate.call(this);
    this.unlockDrag();
    return this.hideSettings(['color', 'brushSize']);
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
    return this.displaySettings(['color', 'brushSize']);
  };

  DrawingModeSwitch.prototype.deactivate = function() {
    DrawingModeSwitch.__super__.deactivate.call(this);
    this.paintMaster.fCanvas.isDrawingMode = this.active;
    return this.hideSettings(['color', 'brushSize']);
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

window.PaintMasterPlugin.tools.SelectionModeSwitch = SelectionModeSwitch = (function(superClass) {
  extend(SelectionModeSwitch, superClass);

  function SelectionModeSwitch(paintMaster1) {
    this.paintMaster = paintMaster1;
    this.onClick = bind(this.onClick, this);
    this.name = 'Выделение';
    this.id = 'selection-mode';
    SelectionModeSwitch.__super__.constructor.call(this, this.paintMaster);
  }

  SelectionModeSwitch.prototype.onClick = function() {
    return this.paintMaster.fCanvas.isDrawingMode = false;
  };

  SelectionModeSwitch.prototype.activate = function() {
    SelectionModeSwitch.__super__.activate.call(this);
    return this.displaySettings(['canvasWidth', 'canvasHeight']);
  };

  SelectionModeSwitch.prototype.deactivate = function() {
    SelectionModeSwitch.__super__.deactivate.call(this);
    return this.hideSettings(['canvasWidth', 'canvasHeight']);
  };

  return SelectionModeSwitch;

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
  painter.addToolboxItem(PaintMasterPlugin.tools.SelectionModeSwitch, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.Crop, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawRect, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawEllipse, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawingModeSwitch, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.DrawArrow, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.AddText, 'top');
  painter.addToolboxItem(PaintMasterPlugin.tools.ClipboardImagePaste, 'top');
  painter.addSettingsItem('Color', 'top');
  painter.addSettingsItem('CanvasWidth', 'top');
  painter.addSettingsItem('CanvasHeight', 'top');
  painter.addSettingsItem('BrushSize', 'top');
  return painter.addSettingsItem('FontSize', 'top');
});
