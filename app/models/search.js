var Search = Class.create(ArticleContainer, {
  initialize: function($super, api, query) {
    $super(api)
    this.query = query
    this.title = $L("Search for #{query}").interpolate(this)
    this.showOrigin = true
    this.canMarkAllRead = false
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.search(this.query, success, failure)
  },

  articleRead: function(subscriptionId) {
  },

  articleNotRead: function(subscriptionId) {
  }
})
