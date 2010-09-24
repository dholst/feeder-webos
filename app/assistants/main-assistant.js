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
    this.controller.modelChanged(this.sources)
    this.spinnerOff()
  },
  
  sourceTapped: function(event) {
    this.controller.stageController.pushScene("subscription", event.item)
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