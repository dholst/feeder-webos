var Folders = Class.create({
  initialize: function(api) {
    this.api = api
    this.items = []
  },
  
  findAll: function(success, failure) {
    this.items.push(new Folder("Test folder 1", 78))
    this.items.push(new Folder("Test folder 2", 87))
    success()
  }
})