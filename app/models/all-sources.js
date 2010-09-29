var AllSources = Class.create({
  initialize: function(api) {
    this.items = []
    this.allArticles = new AllArticles(api)
    this.starred = new Starred(api)
    this.subscriptions = new Subscriptions(api)
    this.resetItems()
  },
  
  resetItems: function() {
    this.items.clear()
    this.items.push(this.allArticles)
    this.items.push(this.starred)
  },
  
  findAll: function(success, failure) {
    this.success = success
    this.failure = failure
    this.resetItems()
    this.subscriptions.findAll(this.foundSubscriptions.bind(this), this.failure)
  },
  
  foundSubscriptions: function() {
    var items = this.items    
    this.subscriptions.folders.items.each(function(folder) {items.push(folder)})
    this.subscriptions.items.each(function(subscription) {items.push(subscription)})
    this.allArticles.setUnreadCount(this.subscriptions.getUnreadCount())
    this.filterReadItems()
    this.success()
  },
  
  filterReadItems: function() {
    var filtered = $A(this.items).select(function(item){return item.sticky || item.unreadCount})
    this.items.clear()
    this.items.push.apply(this.items, filtered)    
  },
  
  articleReadIn: function(subscriptionId) {
    this.items.each(function(source){source.articleRead(subscriptionId)})
  },
  
  articleNotReadIn: function(subscriptionId) {
    this.items.each(function(source){source.articleNotRead(subscriptionId)})
  },
  
  massMarkAsRead: function(count) {
    this.allArticles.decrementUnreadCountBy(count)
  }
}) 