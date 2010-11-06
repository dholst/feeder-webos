var ArticlesAssistant = Class.create(BaseAssistant, {
  initialize: function($super, subscription) {
    $super()
    this.subscription = subscription
    this.subscription.reset()
  },

  setup: function($super) {
    $super()

		this.spacerTemplate = Mojo.View.convertToNode(Mojo.View.render({template: "articles/spacer"}), this.controller.document)

    var listAttributes = {
      itemTemplate: "articles/article",
      dividerTemplate: "articles/divider",
  		dividerFunction: this.divide,
  		onItemRendered: this.itemRendered.bind(this)
    }

    this.controller.setupWidget("articles", listAttributes, this.subscription)
    this.controller.listen("articles", Mojo.Event.listTap, this.articleTapped = this.articleTapped.bind(this))
    this.controller.listen("mark-all-read", Mojo.Event.tap, this.markAllRead = this.markAllRead.bind(this))
    this.controller.listen("articles", Mojo.Event.dragStart, this.dragStart = this.dragStart.bind(this))
    this.controller.listen("error-header", Mojo.Event.tap, this.reload = this.reload.bind(this))

    this.controller.get("header").update(this.subscription.title)

    this.articlesTop = $("articles").offsetTop
    this.scroller = this.controller.getSceneScroller()
    this.scrolling = this.scrolling.bind(this)
  },

  ready: function($super) {
    $super()
    this.findArticles()
  },
  
  reload: function() {
    this.findArticles()
  },

  activate: function($super, changes_or_scroll) {
    $super(changes_or_scroll)

    if(changes_or_scroll && (changes_or_scroll.sortOrderChanged || changes_or_scroll.hideReadArticlesChanged)) {
      this.subscription.reset()
      this.findArticles(true)
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

    if(Preferences.markReadAsScroll() && !this.markingReadAsScroll) {
      this.scroller.observe(Mojo.Event.dragging, this.scrolling)
      this.markingReadAsScroll = true
    }
    else {
      this.scroller.stopObserving(Mojo.Event.dragging, this.scrolling)
    }
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("articles", Mojo.Event.listTap, this.articleTapped)
    this.controller.stopListening("articles", Mojo.Event.dragStart, this.dragStart)
    this.scroller.stopObserving(Mojo.Event.dragging, this.scrolling)
    this.controller.stopListening("mark-all-read", Mojo.Event.tap, this.markAllRead)
    this.controller.stopListening("error-header", Mojo.Event.tap, this.reload)

  },

  findArticles: function(scrollToTop) {
    this.controller.get("error-header").hide()
    this.controller.get("mark-all-read").hide()
    this.smallSpinnerOn()
    this.subscription.findArticles(this.foundArticles.bind(this, scrollToTop || false), this.showError.bind(this))
  },

  foundArticles: function(scrollToTop) {
    this.refreshList(this.controller.get("articles"), this.subscription.items)

    if(scrollToTop) {
      this.controller.getSceneScroller().mojo.revealTop()
    }

    this.smallSpinnerOff()
    this.showMarkAllRead()
  },

  showMarkAllRead: function() {
    this.controller.get("mark-all-read")[this.subscription.canMarkAllRead ? "show" : "hide"]()
  },

  articleTapped: function(event) {
    if(!event.item.load_more) {
      event.item.index = event.index
      this.tappedIndex = event.index
      this.controller.stageController.pushScene("article", event.item, 0)
    }
  },

  divide: function(article) {
    return article.sortDate
  },

  itemRendered: function(listWidget, itemModel, itemNode) {
    itemModel._itemNode = itemNode

    if(itemModel.load_more) {
      this.findArticles()
    }
    else {
      if(!itemModel.isRead) {
        itemNode.addClassName("unread")
      }

      if(itemModel.isStarred) {
        itemNode.addClassName("starred")
        var origin = itemNode.down(".article-origin")
        origin.update("&nbsp;")
        origin.show()
      }

      if(this.subscription.showOrigin) {
        var origin = itemNode.down(".article-origin")
        origin.update(itemModel.origin)
        origin.show()
      }
    }
  },

	scrolling: function(event) {
    var scrollPosition = this.scroller.mojo.getScrollPosition()
    var theBottom = scrollPosition.top - this.scroller.offsetHeight

	  for(var i = 0; i < this.subscription.items.length; i++) {
	    var item = this.subscription.items[i]

      if(item._itemNode && (this.scroller.offsetTop - item._itemNode.offsetTop - item._itemNode.offsetHeight) > theBottom && !item.isRead) {
        item.turnReadOn(function() {})
        item._itemNode.removeClassName("unread")
      }
	  }
	},

  markAllRead: function(event) {
    this.controller.get("mark-all-read").hide()
    this.smallSpinnerOn()
    var count = this.subscription.getUnreadCount()

    this.subscription.markAllRead(
      function() {
        this.smallSpinnerOff()
        this.showMarkAllRead()
        this.refreshList(this.controller.get("articles"), this.subscription.items)
        Mojo.Event.send(document, "MassMarkAsRead", {id: this.subscription.id, count: count})

        if(Preferences.goBackAfterMarkAsRead()) {
          this.controller.stageController.popScene()
        }
      }.bind(this),

      this.showError.bind(this)
    )
  },

  _getNodeFrom: function(event) {
    return event.target.up(".palm-row")
  },

  dragStart: function(event) {
		if(Math.abs(event.filteredDistance.x) > 2 * Math.abs(event.filteredDistance.y)) {
      var node = this._getNodeFrom(event)

  	  Mojo.Drag.setupDropContainer(node, this)

  	  node._dragger = Mojo.Drag.startDragging(
  	    this.controller,
  	    node,
  	    event.down,
  	    {
          preventVertical: true,
          draggingClass: "palm-delete-element",
          preventDropReset: false
  		  }
  		)

  		event.stop()
		}
  },

  dragEnter: function(item) {
		var itemHeight = item.getHeight()
		this.dragHeight = itemHeight
		this.dragAdjNode = undefined
		this.insertSpacer(item)
	},

  dragHover: function(element) {
    var spacer = element._spacer
    spacer.setAttribute("class", "palm-swipe-container");

    spacer.addClassName(element.offsetLeft > 0 ? "swipe-right" : "swipe-left")
    spacer.addClassName(element._mojoListItemModel.isRead ? "swipe-read" : "swipe-not-read")
    spacer.addClassName(element._mojoListItemModel.isStarred ? "swipe-starred" : "swipe-not-starred")

    element._toggleRead = element.offsetLeft > 50
    element._toggleStarred = element.offsetLeft < -50

    if(element._toggleRead) {
      spacer.toggleClassName("swipe-read")
      spacer.toggleClassName("swipe-not-read")
    }

    if(element._toggleStarred) {
      spacer.toggleClassName("swipe-starred")
      spacer.toggleClassName("swipe-not-starred")
    }
  },

	dragDrop: function(element) {
    element._dragger.resetElement()
    delete element._dragger

    element._spacer.remove()
    delete element._spacer

	  if(element._toggleRead) {
	    element._mojoListItemModel.toggleRead()
	    this.refreshList(this.controller.get("articles"), this.subscription.items)
	  }

	  if(element._toggleStarred) {
	    element._mojoListItemModel.toggleStarred()
	    this.refreshList(this.controller.get("articles"), this.subscription.items)
	  }
  },

	insertSpacer: function(itemNode) {
		var spacer = this.spacerTemplate.cloneNode(true)
		itemNode.insert({before: spacer})
		itemNode._spacer = spacer

		var height = Element.getHeight(itemNode) + 'px'
		spacer.style.height = height

    var heightNodes = spacer.querySelectorAll("div[x-mojo-set-height]")

    for(var i = 0; i < heightNodes.length; i++) {
      heightNodes[i].style.height = height
    }
	},

	showError: function() {
    this.smallSpinnerOff()
    this.controller.get("mark-all-read").hide()
    this.controller.get("error-header").show()
	}
})