var AllArticles = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.id = "user/-/state/com.google/reading-list"
    this.title = $L("All Items")
    this.icon = "list"
    this.sticky = true
    this.divideBy = "Home"
    this.hideDivider = "hide-divider"
    this.showOrigin = true
    this.canMarkAllRead = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticles(continuation, success, failure)
  },

  articleRead: function(subscriptionId) {
    this.incrementUnreadCountBy(-1)
  },

  articleNotRead: function(subscriptionId) {
    this.incrementUnreadCountBy(1)
  },

  markAllRead: function(success) {
    this.api.markAllRead(this.id, function() {
      this.clearUnreadCount()
      this.items.each(function(item) {item.isRead = true})
      success()
    }.bind(this))
  }
})