var Folder = Class.create(ArticleContainer, {
  initialize: function($super, api, title, id) {
    $super(api)
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Subscriptions"
    this.subscriptions = [this]
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
      for(var i = 1; i < self.subscriptions.length; i++) {
        self.subscriptions[i].clearUnreadCount()
      }

      self.clearUnreadCount()
      self.items.each(function(item) {item.isRead = true})
      self.recalculateUnreadCounts()
      success()
    })
  },

  addUnreadCount: function(count) {
    this.subscriptions.each(function(subscription) {
      if(subscription.id == count.id) {
        subscription.setUnreadCount(count.count)
      }
    })

    this.recalculateUnreadCounts()
  },

  articleRead: function(subscriptionId) {
    this.subscriptions.each(function(subscription){
      if(subscription.constructor != Folder) {
        subscription.articleRead(subscriptionId)
      }
    })

    this.recalculateUnreadCounts()
  },

  articleNotRead: function(subscriptionId) {
    this.subscriptions.each(function(subscription){
      if(subscription.constructor != Folder) {
        subscription.articleNotRead(subscriptionId)
      }
    })

    this.recalculateUnreadCounts()
  },

  recalculateUnreadCounts: function() {
    this.setUnreadCount(0)

    this.subscriptions.each(function(subscription) {
      this.incrementUnreadCountBy(subscription.getUnreadCount())
    }.bind(this))
  },

  sortAlphabetically: function() {
    this.sortBy(function(subscription) {
      return (subscription.isFolder ? "__FOLDER_" : "__SUBSCRIPTION") + subscription.title.toUpperCase()
    })
  },

  sortManually: function(sortOrder) {
    if(!sortOrder) return

    this.subscriptions.each(function(subscription, index) {
      if(index > 0) {
        subscription.sortNumber = sortOrder.getSortNumberFor(subscription.sortId) + this.subscriptions[0].sortNumber + 1
      }
    }.bind(this))

    this.sortBy(function(subscription) {return subscription.sortNumber})
  },

  sortBy: function(f) {
    var sortedItems = this.subscriptions.sortBy(f)
    this.subscriptions.clear()
    this.subscriptions.push.apply(this.subscriptions, sortedItems)
  }
})
