var FolderAssistant = Class.create(BaseAssistant, {
  initialize: function($super, folder) {
    $super()
    this.folder = folder
    this.subscriptions = {items: []}
  },

  setup: function($super) {
    $super()
    this.filter()

    console.log(this.subscriptions.items.length)
    this.controller.setupWidget("folders", {
      itemTemplate: "folder/folder",
      onItemRendered: this.folderRendered,
      reorderable: Preferences.isManualFeedSort(),
  		swipeToDelete: true
    }, this.subscriptions)

    this.controller.setupWidget("sticky-folders", {itemTemplate: "folder/folder", onItemRendered: this.folderRendered, itemsProperty: "stickySubscriptions"}, this.folder)
    this.controller.listen("sticky-folders", Mojo.Event.listTap, this.folderTaped = this.folderTapped.bind(this))
    this.controller.listen("folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.listen("folders", Mojo.Event.listReorder, this.sourcesReordered = this.sourcesReordered.bind(this))
    this.controller.listen("folders", Mojo.Event.listDelete, this.sourceDeleted = this.sourceDeleted.bind(this))
    this.controller.listen(document, "SubscriptionDeleted", this.filterAndRefresh = this.filterAndRefresh.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("folders", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening(document, "SubscriptionDeleted", this.filterAndRefresh)
  },

  ready: function($super) {
    this.controller.get("header").update(this.folder.title)
  },

  activate: function($super, changes) {
    $super(changes)
    this.filterAndRefresh()
  },

  filterAndRefresh: function() {
    this.filter()
    this.refreshList(this.controller.get("sticky-folders"), this.folder.stickySubscriptions)
    this.refreshList(this.controller.get("folders"), this.subscriptions.items)

    if(!this.subscriptions.items.length) {
      this.controller.stageController.popScene()
    }
  },

  filter: function() {
    this.subscriptions.items.clear()

    this.folder.subscriptions.items.each(function(subscription) {
      if(subscription.unreadCount || !Preferences.hideReadFeeds()) {
        this.subscriptions.items.push(subscription)
      }
    }.bind(this))
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
  },

  sourcesReordered: function(event) {
    var beforeSubscription = null

    if(event.toIndex < this.subscriptions.items.length - 1) {
      var beforeIndex = event.toIndex

      if(event.fromIndex < event.toIndex) {
        beforeIndex += 1
      }

      beforeSubscription = this.subscriptions.items[beforeIndex]
    }

    this.folder.subscriptions.move(event.item, beforeSubscription)
  },

  sourceDeleted: function(event) {
    this.folder.subscriptions.remove(event.item)
  }
})