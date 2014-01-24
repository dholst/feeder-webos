var Fresh = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.id = "user/-/state/com.google/fresh"
    this.title = $L("Fresh")
    this.icon = "fresh"
    this.sticky = true
    this.divideBy = "Home"
    this.hideDivider = "hide-divider"
    this.showOrigin = true
    this.canMarkAllRead = false
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllFresh(continuation, success, failure)
  },

  articleRead: function(subscriptionId) {
  },

  articleNotRead: function(subscriptionId) {
  }
})
