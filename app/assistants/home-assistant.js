var HomeAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api, sources, loaded) {
    $super()
    this.api = api
    this.sources = sources || new AllSources(api)
    BaseAssistant.sources = this.sources
    this.loaded = loaded
    this.showAddSubscription = true
  },

  setup: function($super) {
    $super()
    this.setupLists()
    this.setupListeners()
    this.setupSearch()
  },

  setupLists: function() {
    var stickySourceAttributes = {
      itemTemplate: "home/source",
      onItemRendered: this.sourceRendered
    }

    var subscriptionAttributes = {
      itemTemplate: "home/source",
      dividerTemplate: "home/divider",
      dividerFunction: this.divide,
      onItemRendered: this.sourceRendered,
      reorderable: Preferences.isManualFeedSort(),
      swipeToDelete: true,
      renderLimit: 30
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
    this.controller.listen("error-header", Mojo.Event.tap, this.reload)
    this.controller.listen("header", Mojo.Event.tap, this.scrollToTop = this.scrollToTop.bind(this))
    this.controller.listen("header", Mojo.Event.hold, this.showOrHideFeeds = this.showOrHideFeeds.bind(this))
    this.controller.listen(document, "ArticleRead", this.articleRead = this.articleRead.bind(this))
    this.controller.listen(document, "ArticleNotRead", this.articleNotRead = this.articleNotRead.bind(this))
    this.controller.listen(document, "MassMarkAsRead", this.markedAllRead = this.markedAllRead.bind(this))
    this.controller.listen(document, "SubscriptionDeleted", this.markedAllRead)
    this.controller.listen(document, "FolderDeleted", this.folderDeleted = this.folderDeleted.bind(this))
    this.controller.listen(document, Feeder.Event.refreshWanted, this.refresh = this.refresh.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("subscription-sources", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening("refresh", Mojo.Event.tap, this.reload)
    this.controller.stopListening("error-header", Mojo.Event.tap, this.reload)
    this.controller.stopListening("header", Mojo.Event.tap, this.scrollToTop)
    this.controller.stopListening("header", Mojo.Event.hold, this.showOrHideFeeds)
    this.controller.stopListening(document, "ArticleRead", this.articleRead)
    this.controller.stopListening(document, "ArticleNotRead", this.articleNotRead)
    this.controller.stopListening(document, "MassMarkAsRead", this.markedAllRead)
    this.controller.stopListening(document, "SubscriptionDeleted", this.markedAllRead)
    this.controller.stopListening(document, "FolderDeleted", this.folderDeleted)
    this.controller.stopListening(document, Feeder.Event.refreshWanted, this.refresh)
    this.cleanupSearch()
  },

  ready: function($super) {
    $super()

    if(!this.loaded) {
      this.reload()
    }
  },

  refresh: function() {
    var self = this

    var refreshComplete = function() {
      self.refreshing = false
      Mojo.Event.send(document, Feeder.Event.refreshComplete, {sources: self.sources})
    }

    if(!self.refreshing) {
      self.refreshing = true
      self.sources.findAll(refreshComplete, refreshComplete)
    }
  },

  reload: function() {
    var self = this

    if(!self.reloading) {
      self.reloading = true
      this.controller.get("refresh").hide()
      this.controller.get("error-header").hide()
      self.smallSpinnerOn()

      self.sources.findAll(
        function() {
          self.reloading = false
          self.loaded = true
          self.filterAndRefresh()
        }.bind(this),

        function() {
          this.showError()
        }.bind(this)
      )
    }
  },

  activate: function($super, command) {
    $super(command)

    if("logout" == command) {
      var creds = new Credentials()
      creds.password = null
      creds.server = null
      creds.id = null
	  creds.refreshToken = null
	  creds.accessToken = null
	  creds.tokenType = null
	  creds.plan = null
      creds.clear()
      this.controller.stageController.swapScene("credentials", creds)
    }
    else if(command && command.feedAdded) {
      this.reload()
    }
    else if(command && command.feedSortOrderChanged) {
      this.controller.stageController.swapScene({name: "home", transition: Mojo.Transition.none}, this.api, this.sources, true)
    }
    else {
      this.filterAndRefresh()
    }

    this.active = true
    this.listenForSearch()
  },

  deactivate: function($super) {
    $super()
    this.active = false
    this.stopListeningForSearch()
  },

  filterAndRefresh: function() {
    var self = this

    if(self.loaded) {
      self.sources.sortAndFilter(
        function() {
          self.refreshList(self.controller.get("sticky-sources"), self.sources.stickySources.items)
          self.refreshList(self.controller.get("subscription-sources"), self.sources.subscriptionSources.items)
          self.smallSpinnerOff()
          self.controller.get("refresh").show()
        },

        this.showError.bind(this)
      )
    }
  },

  sourceTapped: function(event) {
    if(event.item.isFolder && !Preferences.combineFolders()) {
      this.controller.stageController.pushScene("folder", this.api, event.item)
    }
    else {
      this.controller.stageController.pushScene("articles", this.api, event.item)
    }
  },

  sourcesReordered: function(event) {
    var beforeSubscription = null

    if(event.toIndex < this.sources.subscriptionSources.items.length - 1) {
      var beforeIndex = event.toIndex

      if(event.fromIndex < event.toIndex) {
        beforeIndex += 1
      }

      beforeSubscription = this.sources.subscriptionSources.items[beforeIndex]
    }

    this.sources.subscriptions.move(event.item, beforeSubscription)
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
    if(this.active) this.filterAndRefresh()
  },

  articleNotRead: function(event) {
    Log.debug("1 item marked not read in " + event.subscriptionId)
    this.sources.articleNotRead(event.subscriptionId)
    if(this.active) this.filterAndRefresh()
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

  folderDeleted: function() {
    this.reload()
  },

  sourceRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      itemNode.addClassName("unread")
    }
  },

  handleCommand: function($super, event) {
    if(!$super(event)) {
      if(Mojo.Event.forward == event.type) {
        this.reload()
      }
    }
  },

  showError: function() {
    this.reloading = false
    this.loaded = false
    this.controller.get("refresh").hide()
    this.controller.get("error-header").show()
    this.smallSpinnerOff()
  },

  doSearch: function(query) {
  	if(this.api.supportsSearch())
    {
    	this.controller.stageController.pushScene("articles", this.api, new Search(this.api, query))
    }
    else
    {
    	Feeder.notify($L("Search Not Available"))
    }
  }
})
