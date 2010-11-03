var AllSources = Class.create({
  initialize: function(api) {
    this.allArticles = new AllArticles(api)
    this.starred = new Starred(api)
    this.shared = new Shared(api)
    this.stickySources = {items: [this.allArticles, this.starred, this.shared]}

    this.subscriptions = new Subscriptions(api)
    this.subscriptionSources = {items: []}
    this.filteredSubscriptionSources = {items: []}
  },

  findAll: function(success, failure) {
    this.subscriptions.findAll(this.foundSubscriptions.bind(this, success), failure)
  },

  foundSubscriptions: function(success) {
    this.subscriptionSources.items.push.apply(this.subscriptionSources.items, this.subscriptions.originalItems)
    this.allArticles.setUnreadCount(this.subscriptions.getUnreadCount())
    success()
  },

  filter: function() {
    this.filteredSubscriptionSources.items.clear()
    var hideReadFeeds = Preferences.hideReadFeeds()

    this.subscriptionSources.items.each(function(subscription) {
      if(!hideReadFeeds || (hideReadFeeds && subscription.unreadCount)) {
        this.filteredSubscriptionSources.items.push(subscription)
      }
    }.bind(this))
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

    console.log("DOOOOOOOOOOOO SOOOOOOOOOOOOOOMETHING HEREEEEEEEEEEEEEEEE")



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