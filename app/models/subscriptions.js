var Subscriptions = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.items = []
  },

  findAll: function(callback) {
    var self = this

    self.api.getAllSubscriptions(function(subscriptions) {
      self.sorted = false
      self.clearUnreadCount()
      self.items.clear()

      var folders = new Folders(self.api)

      subscriptions.each(function(subscriptionData) {
        var subscription = new Subscription(self.api, subscriptionData)
        self.addSubscription(subscription, folders)
      })

      folders.addSortIds(function() {
        self.items.push.apply(self.items, folders.items)
        self.addUnreadCounts(callback)
      })
    })
  },

  addSubscription: function(subscription, folders) {
    if(subscription.belongsToFolder()) {
      subscription.categories.each(function(category) {
        if(category.label) {
          folders.addSubscription(category.id, category.label, subscription)
        }
      })
    }
    else {
      this.items.push(subscription)
    }
  },

  addUnreadCounts: function(callback) {
    var self = this

    self.api.getUnreadCounts(function(counts) {
      counts.each(function(count) {
        if(count.id.startsWith("feed")) {
          self.incrementUnreadCountBy(count.count)

          self.items.each(function(item) {
            if(item.id == count.id) {
              item.setUnreadCount(count.count)
            }

            if(item.isFolder) {
              item.addUnreadCount(count)
            }
          })
        }
      })

      callback()
    })
  },

  sort: function(callback) {
    if(Preferences.isManualFeedSort()) {
      this.sortManually(callback)
    }
    else {
      this.sortAlphabetically(callback)
    }
  },

  sortAlphabetically: function(callback) {
    var self = this

    if(self.sorted == "alphabetic") {
      callback()
    }
    else {
      self.sortBy(function(item) {
        return (item.isFolder ? "__FOLDER_" : "__SUBSCRIPTION_") + item.title.toUpperCase()
      })

      self.sorted = "alphabetic"
      callback()
    }
  },

  sortManually: function(callback) {
    var self = this

    if(self.sorted == "manual") {
      callback()
    }
    else {
      self.api.getSortOrder(function(sortOrder) {
        sortOrder.each(function(key, index) {
          var sortedItem = self.items.find(function(item) {return item.sortId == key})
          if(sortedItem) sortedItem.sortNumber = index
        })

        self.sortBy(function(item) {
          return item.sortNumber
        })

        self.sorted = "manual"
        callback()
      })
    }
  },

  sortBy: function(f) {
    var sortedItems = this.items.sortBy(f)
    this.items.clear()
    this.items.push.apply(this.items, sortedItems)
  },

  remove: function(subscription) {
    var self = this

    self.items.each(function(item, index) {
      if(item.id == subscription.id) {
        self.items.splice(index, 1)
        self.api.unsubscribe(subscription)
        Mojo.Event.send(document, "MassMarkAsRead", {id: subscription.id, count: subscription.unreadCount})
        return
      }
    })
  },

  articleRead: function(subscriptionId) {
    this.items.each(function(subscription) {subscription.articleRead(subscriptionId)})
  },

  articleNotRead: function(subscriptionId) {
    this.items.each(function(subscription) {subscription.articleNotRead(subscriptionId)})
  },

  recalculateFolderCounts: function() {
    this.items.each(function(subscription) {
      if(subscription.isFolder) subscription.recalculateUnreadCounts()
    })
  }
})