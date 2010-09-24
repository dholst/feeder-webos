var Subscription = Class.create(ArticleContainer, {
  initialize: function($super, api, data) {
    $super(api)
    this.id = data.id
    this.title = data.title
    this.icon = "rss"
    this.divideBy = "Subscriptions"
    this.unreadCount = 0
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticlesFor(this.id, continuation, success, failure)
  }
})