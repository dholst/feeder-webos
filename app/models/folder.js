var Folder = Class.create({
  initialize: function(title, id) {
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Folders"
    this.unreadCount = 0
    this.items = []
  },
  
  addUnreadCounts: function(count) {
    this.items.each(function(item) {
      if(item.id == count.id) {
        item.unreadCount = count.count
        this.unreadCount += count.count
      }
    }.bind(this))
  }
})
