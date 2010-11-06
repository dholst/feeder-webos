var Folder = Class.create(ArticleContainer, {
  initialize: function($super, api, title, id) {
    $super(api)
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Subscriptions"
    this.stickySubscriptions = [this]
    this.subscriptions = new FolderSubscriptions(api, this.id)
    this.setUnreadCount(0)
    this.showOrigin = true
    this.canMarkAllRead = true
    this.isFolder = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticlesFor(this.id, continuation, success, failure)
  },

  markAllRead: function(success) {
    var self = this

    self.api.markAllRead(self.id, function() {
      self.subscriptions.items.each(function(subscription) {
        subscription.clearUnreadCount()
      })

      self.clearUnreadCount()
      self.items.each(function(item) {item.isRead = true})
      self.recalculateUnreadCounts()
      success()
    })
  },

  addUnreadCount: function(count) {
    this.subscriptions.items.each(function(subscription) {
      if(subscription.id == count.id) {
        subscription.setUnreadCount(count.count)
      }
    })

    this.recalculateUnreadCounts()
  },

  articleRead: function(subscriptionId) {
    this.subscriptions.items.each(function(subscription){
      subscription.articleRead(subscriptionId)
    })

    this.recalculateUnreadCounts()
  },

  articleNotRead: function(subscriptionId) {
    this.subscriptions.items.each(function(subscription){
      subscription.articleNotRead(subscriptionId)
    })

    this.recalculateUnreadCounts()
  },

  recalculateUnreadCounts: function() {
    this.setUnreadCount(0)

    this.subscriptions.items.each(function(subscription) {
      this.incrementUnreadCountBy(subscription.getUnreadCount())
    }.bind(this))
  },

  sortAlphabetically: function() {
    this.sortBy(function(subscription) {
      return subscription.title.toUpperCase()
    })
  },

  sortManually: function(sortOrder, error) {
    if(!sortOrder) return

    this.subscriptions.items.each(function(subscription, index) {
      subscription.sortNumber = sortOrder.getSortNumberFor(subscription.sortId)
    }.bind(this))

    this.sortBy(function(subscription) {return subscription.sortNumber})
  },

  sortBy: function(f) {
    var sortedItems = this.subscriptions.items.sortBy(f)
    this.subscriptions.items.clear()
    this.subscriptions.items.push.apply(this.subscriptions.items, sortedItems)
  }
})
