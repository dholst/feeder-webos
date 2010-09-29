var Folder = Class.create(Countable, {
  initialize: function(title, id) {
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Folders"
    this.items = []
  },
  
  addUnreadCounts: function(count) {
    this.items.each(function(item) {
      if(item.id == count.id) {
        item.setUnreadCount(count.count)
        this.incrementUnreadCountBy(count.count)
      }
    }.bind(this))
  }
})
