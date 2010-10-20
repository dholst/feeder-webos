var Starred = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.id = "user/-/state/com.google/starred"
    this.title = $L("Starred")
    this.icon = "star"
    this.sticky = true
    this.divideBy = "Home"
    this.hideDivider = "hide-divider"
    this.showOrigin = true
    this.canMarkAllRead = false
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllStarred(continuation, success, failure)
  },

  articleRead: function(subscriptionId) {
  },

  articleNotRead: function(subscriptionId) {
  }
})
