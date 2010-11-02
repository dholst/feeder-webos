var MainAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.sources = new AllSources(api)
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
    this.controller.listen("refresh", Mojo.Event.tap, this.refresh = this.refresh.bind(this))
    this.controller.listen(document, "ArticleRead", this.articleRead = this.articleRead.bind(this))
    this.controller.listen(document, "ArticleNotRead", this.articleNotRead = this.articleNotRead.bind(this))
    this.controller.listen(document, "MassMarkAsRead", this.massMarkAsRead = this.massMarkAsRead.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listReorder, this.sourcesReordered)
    this.controller.stopListening("subscription-sources", Mojo.Event.listDelete, this.sourceDeleted)
    this.controller.stopListening("refresh", Mojo.Event.tap, this.refresh)
    this.controller.stopListening(document, "ArticleRead", this.articleRead)
    this.controller.stopListening(document, "ArticleNotRead", this.articleNotRead)
    this.controller.stopListening(document, "MassMarkAsRead", this.massMarkAsRead)
  },

  ready: function($super) {
    $super()
    this.refresh()
  },

  activate: function($super, commandOrChanges) {
    $super(commandOrChanges)

    if("logout" == commandOrChanges) {
      var creds = new Credentials()
      creds.password = false
      creds.save()
      this.controller.stageController.swapScene("credentials", creds)
    }
    else if(commandOrChanges && commandOrChanges.feedSortOrderChanged) {
      this.refresh()
    }
    else {
      this.filterAndRefresh()
    }
  },

  filterAndRefresh: function() {
    this.refreshList(this.controller.get("sticky-sources"), this.sources.stickySources.items)
    this.refreshList(this.controller.get("subscription-sources"), this.sources.subscriptionSources.items)
  },

  foundEm: function(feeds) {
    this.filterAndRefresh()
    this.smallSpinnerOff()
  },

  sourceTapped: function(event) {
    if(event.item.constructor == Folder && !Preferences.combineFolders()) {
      this.controller.stageController.pushScene("folder", event.item)
    }
    else {
      this.controller.stageController.pushScene("articles", event.item)
    }
  },

  sourcesReordered: function(event) {
    this.sources.subscriptionSources.items.splice(event.fromIndex, 1)
    this.sources.subscriptionSources.items.splice(event.toIndex, 0, event.item)

    var sortOrder = this.sources.subscriptionSources.items.map(function(subscription) {
      return subscription.sortId
    })

    this.api.setSortOrder(sortOrder.join(""))
  },

  sourceDeleted: function(event) {
    this.sources.subscriptionSources.items.splice(event.index, 1)
    this.api.unsubscribe(event.item)
  },

  divide: function(source) {
    return source.divideBy
  },

  refresh: function() {
    this.smallSpinnerOn()
    this.sources.findAll(this.foundEm.bind(this), this.bail.bind(this))
  },

  articleRead: function(event) {
    this.sources.articleReadIn(event.subscriptionId)
  },

  articleNotRead: function(event) {
    this.sources.articleNotReadIn(event.subscriptionId)
  },

  massMarkAsRead: function(event) {
    if(event.id == "user/-/state/com.google/reading-list") {
      this.sources.nukedEmAll()
    }
    else {
      this.sources.massMarkAsRead(event.count)
    }
  },

  sourceRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
    else if(Preferences.hideReadFeeds() && !itemModel.sticky) {
      itemNode.hide()
    }
  }
})