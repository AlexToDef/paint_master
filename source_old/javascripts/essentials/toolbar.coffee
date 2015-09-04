window.PaintMe.Toolbar = class Toolbar
  constructor: (paintObj) ->
    @toolset = {}
    @actionset = {}
    @paintObj = paintObj
    @appendToolbarElement()
    @appendTools()
    @appendActions()
    @setEventHandlers()

  appendToolbarElement: ->
    template = '<div class="at-toolbar"><div class="controls actions"></div><div class="controls tools"></div></div>'
    @element = $(template).insertAfter($('canvas'))  
    
  appendTools: ->
    if @paintObj.opts.tools.length > 0
      tools = window.PaintMe.Instruments
    else
      tools = window.PaintMe.Instruments
    for own key, value of tools
      console.log value
      @addTool(key, value)
      
  appendActions: ->
    if @paintObj.opts.actions
      actions = window.PaintMe.Actions
    else
      actions = window.PaintMe.Actions
    for own key, value of actions
      @addAction(key, value)
      
  setEventHandlers: ->
    self = @
    $('body').on 'click', '.tool', ->
      toolName = $(this).data('name')
      console.log toolName
      self.tool = self.toolset[toolName]
      $('.at-toolbar .tool.active').removeClass 'active'
      $('.at-toolbar .tool[data-name="' + toolName + '"').addClass 'active'
      self.tool.onPick(self.paintObj)
    $('body').on 'click', '.action', ->
      actionName = $(this).data('name')
      self.actionset[actionName].apply self.paintObj

  addTool: (name, tool) ->
    @toolset[name] = new tool
    block = $("<div class='tool' data-name='#{name}'>#{@toolset[name].iconCode}</div>").appendTo(@element.find('.tools'))

  addAction: (name, action) ->
    @actionset[name] = new action
    block = $("<div class='action' data-name='#{name}'>#{@actionset[name].iconCode}</div>").appendTo(@element.find('.actions'))

  includeTool: (name, tool) ->
    @toolset[name] = new tool(@paintObj)
    
  dismiss: =>
    @element.remove()
    @actionset.PickColor.remove()