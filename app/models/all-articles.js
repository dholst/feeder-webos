var AllArticles = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.title = "All Items"
    this.icon = "list"
    this.sticky = true
    this.unreadCount = 0
    this.divideBy = "Home"
    this.hideDivider = "hide-divider"
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticles(continuation, success, failure)
  }
})