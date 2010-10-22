var Folder = Class.create(ArticleContainer, {
  initialize: function(title, id) {
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Folders"
    this.items = [this]
    this.setUnreadCount(0)
  },

  addUnreadCounts: function(count) {
    this.items.each(function(subscription) {
      if(subscription.id == count.id) {
        subscription.setUnreadCount(count.count)
      }
    })

    this.recalculateUnreadCounts()
  },

  articleRead: function(subscriptionId) {
    this.items.each(function(subscription){subscription.articleRead(subscriptionId)})
    this.recalculateUnreadCounts()
  },

  articleNotRead: function(subscriptionId) {
    this.items.each(function(subscription){subscription.articleNotRead(subscriptionId)})
    this.recalculateUnreadCounts()
  },

  recalculateUnreadCounts: function() {
    this.setUnreadCount(0)

    this.items.each(function(subscription) {
      this.incrementUnreadCountBy(subscription.getUnreadCount())
    }.bind(this))
  }
})
