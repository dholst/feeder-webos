var Folder = Class.create({
  initialize: function(title, unreadCount) {
    this.title = title
    this.unreadCount = unreadCount
    this.klass = this.unreadCount ? "not-read" : "read"
    this.items = []
  }
})
