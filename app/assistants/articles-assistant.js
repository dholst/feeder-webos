var ArticlesAssistant = Class.create(BaseAssistant, {
  initialize: function($super, subscription) {
    $super()
    this.subscription = subscription
    this.subscription.reset()
  },

  setup: function($super) {
    $super()

    var listAttributes = {
      itemTemplate: "articles/article",
      dividerTemplate: "articles/divider",
  		dividerFunction: this.divide,
  		onItemRendered: this.itemRendered.bind(this)
    }

    this.controller.setupWidget("articles", listAttributes, this.subscription)
    this.controller.listen("articles", Mojo.Event.listTap, this.articleTapped = this.articleTapped.bind(this))
    this.controller.listen("mark-all-read", Mojo.Event.tap, this.markAllRead = this.markAllRead.bind(this))
  },

  ready: function($super) {
    $super()
    this.controller.get("header").update(this.subscription.title)
    this.findArticles()
  },

  activate: function($super, changes_or_scroll) {
    $super()

    if(changes_or_scroll && (changes_or_scroll.sortOrderChanged || changes_or_scroll.hideReadArticlesChanged)) {
      this.subscription.reset()
      this.findArticles()
    }
    else {
      this.refreshList(this.controller.get("articles"), this.subscription.items)

      if("top" == changes_or_scroll) {
        this.controller.getSceneScroller().mojo.revealTop()
      }
      else if("bottom" == changes_or_scroll) {
        this.controller.getSceneScroller().mojo.revealBottom()
      }
      else if(parseInt(changes_or_scroll)) {
        this.tappedIndex = this.tappedIndex + parseInt(changes_or_scroll)
        this.controller.get("articles").mojo.revealItem(this.tappedIndex, true)
      }
    }
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("articles", Mojo.Event.listTap, this.articleTapped)
  },

  findArticles: function() {
    this.smallSpinnerOn()
    this.subscription.findArticles(this.foundArticles.bind(this), this.bail.bind(this))
  },

  foundArticles: function() {
    this.refreshList(this.controller.get("articles"), this.subscription.items)
    this.smallSpinnerOff()
    this.showMarkAllRead()
  },

  showMarkAllRead: function() {
    if(this.subscription.markAllRead) {
      this.controller.get("mark-all-read").show()
    }
  },

  articleTapped: function(event) {
    if(event.item.load_more) {
      this.findArticles()
    }
    else {
      event.item.index = event.index
      this.tappedIndex = event.index
      this.controller.stageController.pushScene("article", event.item, 0)
    }
  },

  divide: function(article) {
    return article.sortDate
  },

  itemRendered: function(listWidget, itemModel, itemNode) {
    if(!itemModel.isRead) {
      $(itemNode).addClassName("unread")
    }

    if(this.subscription.showOrigin) {
      var origin = itemNode.down(".article-origin")
      origin.update(itemModel.origin)
      origin.show()
    }
  },

  markAllRead: function(event) {
    this.controller.get("mark-all-read").hide()
    this.smallSpinnerOn()
    var count = this.subscription.getUnreadCount()

    this.subscription.markAllRead(function() {
      this.smallSpinnerOff()
      this.showMarkAllRead()
      this.refreshList(this.controller.get("articles"), this.subscription.items)
      Mojo.Event.send(document, "MassMarkAsRead", {id: this.subscription.id, count: count})
    }.bind(this))
  }
})