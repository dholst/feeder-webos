var MainAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.sources = new AllSources(api)
  },

  setup: function($super) {
    $super()

    Feeder.Metrix.checkBulletinBoard(this.controller, 20);

    var stickySourceAttributes = {
      itemTemplate: "main/source",
  		onItemRendered: this.sourceRendered
    }

    var subscriptionAttributes = {
      itemTemplate: "main/source",
      dividerTemplate: "main/divider",
  		dividerFunction: this.divide,
  		onItemRendered: this.sourceRendered,
  		reorderable: true
    }

    this.controller.setupWidget("sticky-sources", stickySourceAttributes, this.sources.stickySources)
    this.controller.setupWidget("subscription-sources", subscriptionAttributes, this.sources.subscriptionSources)
    this.controller.listen("sticky-sources", Mojo.Event.listTap, this.sourceTapped = this.sourceTapped.bind(this))
    this.controller.listen("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.listen("refresh", Mojo.Event.tap, this.refresh = this.refresh.bind(this))
    this.controller.listen(document, "ArticleRead", this.articleRead = this.articleRead.bind(this))
    this.controller.listen(document, "ArticleNotRead", this.articleNotRead = this.articleNotRead.bind(this))
    this.controller.listen(document, "MassMarkAsRead", this.massMarkAsRead = this.massMarkAsRead.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("sticky-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("subscription-sources", Mojo.Event.listTap, this.sourceTapped)
    this.controller.stopListening("refresh", Mojo.Event.tap, this.refresh)
    this.controller.stopListening(document, "ArticleRead", this.articleRead)
    this.controller.stopListening(document, "ArticleNotRead", this.articleNotRead)
    this.controller.stopListening(document, "MassMarkAsRead", this.massMarkAsRead)
  },

  ready: function($super) {
    $super()
    this.refresh()
  },

  activate: function($super, command) {
    $super()

    if("logout" == command) {
      var creds = new Credentials()
      creds.password = false
      creds.save()
      this.controller.stageController.swapScene("credentials", creds)
    }
    else {
      this.filterReadItems(this.sources.stickySources)
      this.filterReadItems(this.sources.subscriptionSources)
      this.refreshList(this.controller.get("sticky-sources"), this.sources.stickySources.items)
      this.refreshList(this.controller.get("subscription-sources"), this.sources.subscriptionSources.items)
    }
  },

  foundEm: function(feeds) {
    this.filterReadItems(this.sources.stickySources)
    this.filterReadItems(this.sources.subscriptionSources)
    this.refreshList(this.controller.get("sticky-sources"), this.sources.stickySources.items)
    this.refreshList(this.controller.get("subscription-sources"), this.sources.subscriptionSources.items)
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
  }
})