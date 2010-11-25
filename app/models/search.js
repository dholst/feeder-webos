var Search = Class.create(ArticleContainer, {
  initialize: function($super, api, query, id) {
    $super(api)
    this.query = query
    this.id = id
    this.title = $L("Search for #{query}").interpolate(this)
    this.showOrigin = true
    this.canMarkAllRead = false
    this.disableSearch = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.search(this.query, this.id, success, failure)
  },

  articleRead: function(subscriptionId) {
  },

  articleNotRead: function(subscriptionId) {
  }
})
