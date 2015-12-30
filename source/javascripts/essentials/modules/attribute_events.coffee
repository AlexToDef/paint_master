setAttributeWatchers = (paintMaster, collection, propName) ->
  savedVal = collection[propName]
  if "#{propName}" != 'test'
    collection["_#{propName}"] = savedVal
    Object.defineProperty collection, propName, {
      get: ->
        collection["_#{propName}"]
      set: (newVal) ->
        oldVal = collection["_#{propName}"]
        collection["_#{propName}"] = newVal
        event = new CustomEvent('pmSettingsChange', detail: { property: propName, oldVal: oldVal, newVal: newVal });
        document.dispatchEvent(event)
        window.localStorage["pmAttr[#{propName}]"] = newVal
    }

window.PaintMasterPlugin.modules.AttributeEvents = 
  setWatchersOnCollection: (paintMaster, collection) ->
    for name, oldVal of collection
      setAttributeWatchers(paintMaster, collection, name)

  setWatcherOnCollectionElement: (paintMaster, collection, propName) ->
    savedVal = collection[propName]
    if "#{propName}" != 'test'
      collection["_#{propName}"] = savedVal
      Object.defineProperty collection, propName, {
        get: ->
          collection["_#{propName}"]
        set: (newVal) ->
          oldVal = collection["_#{propName}"]
          collection["_#{propName}"] = newVal
          event = new CustomEvent('pmSettingsChange', detail: { property: propName, oldVal: oldVal, newVal: newVal });
          document.dispatchEvent(event)
          window.localStorage["pmAttr[#{propName}]"] = newVal
      } 