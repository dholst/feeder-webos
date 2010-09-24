var AllSources = Class.create({
  initialize: function(api) {
    this.allArticles = new AllArticles(api)
    this.starred = new Starred(api)
    this.subscriptions = new Subscriptions(api)
    this.folders = new Folders(api)
    this.items = []
  },
  
  findAll: function(success, failure) {
    this.items.clear()
    this.success = success
    this.failure = failure
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

    this.addStarredItem()
  },
  
  addStarredItem: function() {
    this.starred.icon = "star"
    this.items.unshift(this.starred)
    this.addAllArticlesItem()
  },
    
  addAllArticlesItem: function() {
    this.allArticles.icon = "list"
    this.allArticles.unreadCount = this.subscriptions.unreadCount
    this.items.unshift(this.allArticles)
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