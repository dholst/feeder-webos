var Folders = Class.create({
  initialize: function(api) {
    this.api = api
    this.items = []
  },

  clear: function() {
    this.items.clear()
  },
  
  addSubscription: function(id, label, subscription) {
    var folder = this.items.find(function(f) {return f.id == id})
    
    if(!folder) {
      folder = new Folder(label, id)
      this.items.push(folder)
    }
    
    folder.items.push(subscription)
  },
  
  addUnreadCounts: function(count) {
    this.items.each(function(item) {
      item.addUnreadCounts(count)
    })
  }
})