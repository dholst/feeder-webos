var FolderAssistant = Class.create(BaseAssistant, {
  initialize: function($super, folder) {
    $super()
    this.folder = folder
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("folders", {
      itemTemplate: "folder/folder",
      onItemRendered: this.folderRendered,
      itemsProperty: "subscriptions",
      reorderable: Preferences.isManualFeedSort(),
  		swipeToDelete: true
    }, this.folder)

    this.controller.setupWidget("sticky-folders", {itemTemplate: "folder/folder", onItemRendered: this.folderRendered, itemsProperty: "stickySubscriptions"}, this.folder)
    this.controller.listen("sticky-folders", Mojo.Event.listTap, this.folderTaped = this.folderTapped.bind(this))
    this.controller.listen("folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.listen("folders", Mojo.Event.listReorder, this.sourcesReordered = this.sourcesReordered.bind(this))
    this.controller.listen("folders", Mojo.Event.listDelete, this.sourceDeleted = this.sourceDeleted.bind(this))
    this.controller.listen(document, "SubscriptionDeleted", this.refresh = this.refresh.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("folders", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening(document, "SubscriptionDeleted", this.refresh)
  },

  ready: function($super) {
    this.controller.get("header").update(this.folder.title)
  },

  activate: function($super, changes) {
    $super(changes)
    this.refresh()
  },

  refresh: function() {
    this.refreshList(this.controller.get("sticky-folders"), this.folder.stickySubscriptions)
    this.refreshList(this.controller.get("folders"), this.folder.subscriptions.items)

    if(!this.folder.subscriptions.items.length) {
      this.controller.stageController.popScene()
    }    
  },
  
  folderTapped: function(event) {
    this.controller.stageController.pushScene("articles", event.item)
  },

  folderRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.constructor == Folder) {
      itemNode.down(".folder-title").update("All")
    }

    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
    else if(Preferences.hideReadFeeds() && !itemModel.sticky) {
      itemNode.hide()
    }
  },

  sourcesReordered: function(event) {
    var beforeSubscription = null

    if(event.toIndex < this.folder.subscriptions.items.length - 1) {
      var beforeIndex = event.toIndex

      if(event.fromIndex < event.toIndex) {
        beforeIndex += 1
      }

      beforeSubscription = this.folder.subscriptions.items[beforeIndex]
    }

    this.folder.subscriptions.move(event.item, beforeSubscription)
  },

  sourceDeleted: function(event) {
    this.folder.subscriptions.remove(event.item)
  }
})