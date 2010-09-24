var MainAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.sources = new AllSources(api)
  },
  
  setup: function($super) {
    $super()
    
    var listAttributes = {
      itemTemplate: "main/source",
      dividerTemplate: "main/divider",
  		dividerFunction: this.divide,
  		onItemRendered: this.itemRendered
    }
    
    this.controller.setupWidget("sources", listAttributes, this.sources)
    this.controller.listen("sources", Mojo.Event.listTap, this.sourceTapped = this.sourceTapped.bind(this))
  },
  
  cleanup: function($super) {
    $super()
    this.controller.stopListening("sources", Mojo.Event.listTap, this.sourceTapped)
  },
  
  ready: function($super) {
    $super()
    this.spinnerOn()
    this.sources.findAll(this.foundEm.bind(this), this.bail.bind(this))
  },
  
  foundEm: function(feeds) {
    var sources = this.controller.get("sources")
    sources.mojo.noticeUpdatedItems(0, this.sources.items)
    sources.mojo.setLength(this.sources.items.length)
    this.spinnerOff()
  },
  
  sourceTapped: function(event) {
    if(event.item.constructor == Folder) {
      this.controller.stageController.pushScene("folder", event.item)
    }
    else {
      this.controller.stageController.pushScene("articles", event.item)
    }
  },
  
  divide: function(source) {
    return source.divideBy
  },
  
  itemRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
  }
})