var Subscription = Class.create(ArticleContainer, {
  initialize: function($super, api, data) {
    $super(api)
    this.id = data.id
    this.title = data.title
    this.icon = "rss"
    this.divideBy = "Subscriptions"
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
      this.items.each(function(item) {item.isRead = true})
      success()
    }.bind(this))
  } 
})