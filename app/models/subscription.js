var Subscription = Class.create(ArticleContainer, {
  initialize: function($super, api, data) {
    $super(api)
    this.id = data.id
    this.title = data.title
    this.icon = "rss"
    this.divideBy = "Subscriptions"
    this.canMarkAllRead = true
    this.sortId = data.sortid
    this.categories = data.categories
  },

  belongsToFolder: function() {
    return this.categories && this.categories.length
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticlesFor(this.id, continuation, success, failure)
  },

  articleRead: function(subscriptionId) {
    if(this.id == subscriptionId) {
      this.incrementUnreadCountBy(-1)
    }
  },

  articleNotRead: function(subscriptionId) {
    if(this.id == subscriptionId) {
      this.incrementUnreadCountBy(1)
    }
  },

  markAllRead: function(success) {
    this.api.markAllRead(this.id, function() {
      this.clearUnreadCount()
      this.items.each(function(item) {item.isRead = true})
      success()
    }.bind(this))
  }
})