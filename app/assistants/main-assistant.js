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
    this.controller.listen("refresh", Mojo.Event.tap, this.refresh = this.refresh.bind(this))
  },
  
  cleanup: function($super) {
    $super()
    this.controller.stopListening("sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("refresh", Mojo.Event.tap, this.refresh)
  },
  
  ready: function($super) {
    $super()
    this.refresh()
  },
  
  foundEm: function(feeds) {
    var sources = this.controller.get("sources")
    sources.mojo.noticeUpdatedItems(0, this.sources.items)
    sources.mojo.setLength(this.sources.items.length)
    this.smallSpinnerOff()
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
  },
  
  refresh: function() {
    this.smallSpinnerOn()
    this.sources.findAll(this.foundEm.bind(this), this.bail.bind(this))
  }
})