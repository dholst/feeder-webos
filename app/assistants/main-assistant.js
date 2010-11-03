var MainAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.sources = new AllSources(api)
    this.showAddSubscription = true
  },

  setup: function($super) {
    $super()
    Feeder.Metrix.checkBulletinBoard(this.controller, 20);
    this.setupLists()
    this.setupListeners()
  },

  setupLists: function() {
    var stickySourceAttributes = {
      itemTemplate: "main/source",
  		onItemRendered: this.sourceRendered
    }

    var subscriptionAttributes = {
      itemTemplate: "main/source",
      dividerTemplate: "main/divider",
  		dividerFunction: this.divide,
  		onItemRendered: this.sourceRendered,
  		reorderable: Preferences.isManualFeedSort(),
  		swipeToDelete: true,
    }

    this.controller.setupWidget("sticky-sources", stickySourceAttributes, this.sources.stickySources)
    this.controller.setupWidget("subscription-sources", subscriptionAttributes, this.sources.subscriptionSources)
  },

  setupListeners: function() {
    this.controller.listen("sticky-sources", Mojo.Event.listTap, this.sourceTapped = this.sourceTapped.bind(this))
    this.controller.listen("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.listen("subscription-sources", Mojo.Event.listReorder, this.sourcesReordered = this.sourcesReordered.bind(this))
    this.controller.listen("subscription-sources", Mojo.Event.listDelete, this.sourceDeleted = this.sourceDeleted.bind(this))
    this.controller.listen("refresh", Mojo.Event.tap, this.reload = this.reload.bind(this))
    this.controller.listen(document, "ArticleRead", this.articleRead = this.articleRead.bind(this))
    this.controller.listen(document, "ArticleNotRead", this.articleNotRead = this.articleNotRead.bind(this))
    this.controller.listen(document, "MassMarkAsRead", this.markedAllRead = this.markedAllRead.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("subscription-sources", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening("refresh", Mojo.Event.tap, this.reload)
    this.controller.stopListening(document, "ArticleRead", this.articleRead)
    this.controller.stopListening(document, "ArticleNotRead", this.articleNotRead)
    this.controller.stopListening(document, "MassMarkAsRead", this.markedAllRead)
  },

  ready: function($super) {
    $super()
    this.reload()
  },

  reload: function() {
    var self = this

    if(!self.reloading) {
      self.reloading = true
      self.smallSpinnerOn()

      self.sources.findAll(function() {
        self.reloading = false
        self.filterAndRefresh()
        self.smallSpinnerOff()
      })
    }
  },

  activate: function($super, command) {
    $super(command)

    if("logout" == command) {
      var creds = new Credentials()
      creds.password = false
      creds.save()
      this.controller.stageController.swapScene("credentials", creds)
    }
    else if(command && command.feedAdded) {
      this.reload()
    }
    else if(command && command.feedSortOrderChanged) {
      this.controller.stageController.swapScene("main", this.api)
    }
    else {
      this.filterAndRefresh()
    }
  },

  filterAndRefresh: function() {
    var self = this

    if(!self.reloading) {
      self.sources.sortAndFilter(function() {
        self.refreshList(self.controller.get("sticky-sources"), self.sources.stickySources.items)
        self.refreshList(self.controller.get("subscription-sources"), self.sources.subscriptionSources.items)
      })
    }
  },

  sourceTapped: function(event) {
    if(event.item.isFolder && !Preferences.combineFolders()) {
      this.controller.stageController.pushScene("folder", event.item)
    }
    else {
      this.controller.stageController.pushScene("articles", event.item)
    }
  },

  sourcesReordered: function(event) {
    // this.sources.subscriptionSources.items.splice(event.fromIndex, 1)
    // this.sources.subscriptionSources.items.splice(event.toIndex, 0, event.item)
    //
    // var sortOrder = this.sources.subscriptionSources.items.map(function(subscription) {
    //   return subscription.sortId
    // })
    //
    // this.api.setSortOrder(sortOrder.join(""))
  },

  sourceDeleted: function(event) {
    this.sources.subscriptions.remove(event.item)
  },

  divide: function(source) {
    return source.divideBy
  },

  articleRead: function(event) {
    Log.debug("1 item marked read in " + event.subscriptionId)
    this.sources.articleRead(event.subscriptionId)
  },

  articleNotRead: function(event) {
    Log.debug("1 item marked not read in " + event.subscriptionId)
    this.sources.articleNotRead(event.subscriptionId)
  },

  markedAllRead: function(event) {
    Log.debug(event.count + " items marked read in " + event.id)

    if(event.id == "user/-/state/com.google/reading-list") {
      this.sources.nukedEmAll()
    }
    else {
      this.sources.markedAllRead(event.count)
    }

    this.filterAndRefresh()
  },

  sourceRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
  }
})