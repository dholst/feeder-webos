var Folder = Class.create(ArticleContainer, {
  initialize: function($super, api, title, id) {
    $super(api)
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Folders"
    this.subscriptions = [this]
    this.setUnreadCount(0)
    this.showOrigin = true
    this.canMarkAllRead = true
    // this.sortId = 
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticlesFor(this.id, continuation, success, failure)
  },

  markAllRead: function(success) {
    this.api.markAllRead(this.id, function() {
      for(var i = 1; i < this.subscriptions.length; i++) {
        this.subscriptions[i].clearUnreadCount()
      }
      this.clearUnreadCount()
      this.items.each(function(item) {item.isRead = true})
      this.recalculateUnreadCounts()
      success()
    }.bind(this))
  },

  addUnreadCounts: function(count) {
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
  }
})
