var AllSources = Class.create({
  initialize: function(api) {
    this.allArticles = new AllArticles(api)
    this.starred = new Starred(api)
    this.subscriptions = new Subscriptions(api)
    this.folders = new Folders(api)
  },
  
  findAll: function(success, failure) {
    this.items = []
    this.success = success
    this.failure = failure
    this.findAllArticles()
  },
  
  findAllArticles: function() {
    this.foundAllArticles()
  },
  
  foundAllArticles: function() {
    this.allArticles.icon = "list"
    this.items.push(this.allArticles)
    this.findAllStarred()
  },
  
  findAllStarred: function() {
    this.foundAllStarred()
  },
  
  foundAllStarred: function() {
    this.starred.icon = "star"
    this.items.push(this.starred)
    this.findAllSubscriptions()
  },
  
  findAllSubscriptions: function() {
    this.subscriptions.findAll(this.foundSubscriptions.bind(this), this.failure)
  },
  
  foundSubscriptions: function() {
    this.subscriptions.items.each(function(subscription) {
      subscription.divideBy = "Subscriptions"
      subscription.icon = "rss"
      this.items.push(subscription)
    }.bind(this))

    this.findAllFolders()
  },
  
  findAllFolders: function() {
    this.folders.findAll(this.foundFolders.bind(this), this.failure)
  },
  
  foundFolders: function() {
    this.folders.items.each(function(folder) {
      folder.divideBy = "Folders"
      folder.icon = "folder"
      this.items.push(folder)
    }.bind(this))

    this.success()
  }
}) 