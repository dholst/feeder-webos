var FolderAssistant = Class.create(BaseAssistant, {
  initialize: function($super, folder) {
    $super()
    this.folder = folder
    this.subscriptions = {items: []}
  },

  setup: function($super) {
    $super()
    this.filter()

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
    this.controller.listen("header", Mojo.Event.tap, this.scrollToTop = this.scrollToTop.bind(this))
    this.controller.listen("header", Mojo.Event.hold, this.showOrHideFeeds = this.showOrHideFeeds.bind(this))
    this.controller.listen(document, "SubscriptionDeleted", this.filterAndRefresh = this.filterAndRefresh.bind(this))
    this.controller.listen(document, Feeder.Event.refreshComplete, this.refreshComplete = this.refreshComplete.bind(this))
    this.controller.get("header").update(this.folder.title)
    this.setupSearch()
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listTap, this.folderTaped)
    this.controller.stopListening("folders", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("folders", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening("header", Mojo.Event.tap, this.scrollToTop)
    this.controller.stopListening("header", Mojo.Event.hold, this.showOrHideFeeds)
    this.controller.stopListening(document, "SubscriptionDeleted", this.filterAndRefresh)
    this.cleanupSearch()
  },

  activate: function($super, changes) {
    $super(changes)
    this.filterAndRefresh()
    this.listenForSearch()
  },

  deactivate: function($super) {
    $super()
    this.stopListeningForSearch()
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
      itemNode.down(".folder-title").update($L("All"))
    }

    if(itemModel.unreadCount) {
      itemNode.addClassName("unread")
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
  },

  doSearch: function(query) {
    this.controller.stageController.pushScene("articles", new Search(this.folder.api, query, this.folder.id))
  },

  handleCommand: function($super, event) {
    if(!$super(event)) {
      if(Mojo.Event.forward == event.type) {
        this.refresh()
      }
    }
  },

  refresh: function() {
    if(!self.refreshing) {
      this.refreshing = true
      this.smallSpinnerOn()
      Mojo.Event.send(document, Feeder.Event.refreshWanted, {})
    }
  },

  refreshComplete: function(event) {
    var self = this
    this.refreshing = false

    event.sources.subscriptions.items.each(function(subscription) {
      if(self.folder.id == subscription.id) {
        self.folder = subscription
        throw $break
      }
    })

    this.filterAndRefresh()
    this.smallSpinnerOff()
  }
})
