var AllArticles = Class.create({
  initialize: function(api, unreadCount) {
    this.api = api
    this.title = "All Items"
    this.icon = "list"
    this.sticky = true
    this.unreadCount = unreadCount
  }
})