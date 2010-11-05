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
      folder = new Folder(this.api, label, id)
      this.items.push(folder)
    }

    folder.subscriptions.items.push(subscription)
  },

  addSortIds: function(callback) {
    var self = this

    self.api.getTags(function(tags) {
      tags.each(function(tag) {
        var folder = self.items.find(function(item) {return item.id == tag.id})
        if(folder) folder.sortId = tag.sortid
      })

      callback()
    })
  }
})