var AllSources = Class.create({
  initialize: function(api) {
    this.all = new AllArticles(api)
    this.starred = new Starred(api)
    this.shared = new Shared(api)
    this.stickySources = {items: [this.all, this.starred, this.shared]}

    this.subscriptions = new Subscriptions(api)
    this.subscriptionSources = {items: []}
  },

  findAll: function(callback) {
    var self = this

    self.subscriptions.findAll(function() {
      self.all.setUnreadCount(self.subscriptions.getUnreadCount())
      callback()
    })
  },

  sortAndFilter: function(callback) {
    var self = this
    self.subscriptionSources.items.clear()

    self.subscriptions.sort(function() {
      var hideReadFeeds = Preferences.hideReadFeeds()

      self.subscriptions.items.each(function(subscription) {
        if(!hideReadFeeds || (hideReadFeeds && subscription.unreadCount)) {
          self.subscriptionSources.items.push(subscription)
        }
      })

      callback()
    })
  },

  articleRead: function(subscriptionId) {
    this.all.decrementUnreadCountBy(1)
    this.subscriptions.articleRead(subscriptionId)
  },

  articleNotRead: function(subscriptionId) {
    this.all.incrementUnreadCountBy(1)
    this.subscriptions.articleNotRead(subscriptionId)
  },

  markedAllRead: function(count) {
    this.all.decrementUnreadCountBy(count)
    this.subscriptions.recalculateFolderCounts()
  },

  nukedEmAll: function() {
    this.all.clearUnreadCount()

    // this.subscriptions.items.each(function(subscription) {
    //   subscription.clearUnreadCount()
    // })
    //
    // this.subscriptions.folders.items.each(function(folder) {
    //   folder.subscriptions.each(function(subscription) {
    //     subscription.clearUnreadCount()
    //   })
    //
    //   folder.recalculateUnreadCounts()
    // })
  }
})