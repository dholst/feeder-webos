var AllSources = Class.create({
  initialize: function(api) {
    this.stickySources = {items: []}
    this.subscriptionSources = {items: []}
    this.allArticles = new AllArticles(api)
    this.starred = new Starred(api)
    this.shared = new Shared(api)
    this.subscriptions = new Subscriptions(api)
    this.resetItems()
  },

  resetItems: function() {
    this.stickySources.items = [this.allArticles, this.starred, this.shared]
    this.subscriptionSources.items.clear()
  },

  findAll: function(success, failure) {
    this.success = success
    this.failure = failure
    this.resetItems()
    this.subscriptions.findAll(this.foundSubscriptions.bind(this), this.failure)
  },

  foundSubscriptions: function() {
    var items = this.subscriptionSources.items
    this.subscriptions.folders.items.each(function(folder) {items.push(folder)})
    this.subscriptions.items.each(function(subscription) {items.push(subscription)})
    this.allArticles.setUnreadCount(this.subscriptions.getUnreadCount())
    this.success()
  },

  articleReadIn: function(subscriptionId) {
    this.stickySources.items.each(function(source){source.articleRead(subscriptionId)})
    this.subscriptionSources.items.each(function(source){source.articleRead(subscriptionId)})
  },

  articleNotReadIn: function(subscriptionId) {
    this.stickySources.items.each(function(source){source.articleNotRead(subscriptionId)})
    this.subscriptionSources.items.each(function(source){source.articleNotRead(subscriptionId)})
  },

  massMarkAsRead: function(count) {
    this.allArticles.decrementUnreadCountBy(count)
    
    this.subscriptions.folders.items.each(function(folder) {
      folder.recalculateUnreadCounts()
    })
  },

  nukedEmAll: function() {
    this.allArticles.clearUnreadCount()

    this.subscriptions.items.each(function(subscription) {
      subscription.clearUnreadCount()
    })

    this.subscriptions.folders.items.each(function(folder) {
      folder.subscriptions.each(function(subscription) {
        subscription.clearUnreadCount()
      })

      folder.recalculateUnreadCounts()
    })
  }
})