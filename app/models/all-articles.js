var AllArticles = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.id = "user/-/state/com.google/reading-list"
    this.title = "All Items"
    this.icon = "list"
    this.sticky = true
    this.divideBy = "Home"
    this.hideDivider = "hide-divider"
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticles(continuation, success, failure)
  },
  
  articleRead: function(subscriptionId) {
    this.incrementUnreadCountBy(-1)
  },
  
  articleNotRead: function(subscriptionId) {
    this.incrementUnreadCountBy(1)
  }
})