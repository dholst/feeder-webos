var Starred = Class.create(ArticleContainer, {
  initialize: function($super, api) {
    $super(api)
    this.title = "Starred"
    this.icon = "star"
    this.sticky = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllStarred(continuation, success, failure)
  }
})
