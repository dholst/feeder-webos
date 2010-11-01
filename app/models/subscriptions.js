var Subscriptions = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.folders = new Folders(api)
    this.items = []
  },

  findAll: function(success, failure) {
    var onSuccess = function(subscriptions) {
      this.clearUnreadCount()
      this.items.clear()
      this.folders.clear()

      subscriptions.each(function(subscriptionData) {
        if(subscriptionData.categories && subscriptionData.categories.length) {
          this.addSubscriptionToFolders(subscriptionData)
        }
        else {
          this.items.push(new Subscription(this.api, subscriptionData))
        }
      }.bind(this))

      this.addUnreadCounts(success, failure)
    }.bind(this)

    this.api.getAllSubscriptions(onSuccess, failure)
  },

  addSubscriptionToFolders: function(subscriptionData) {
    var subscription = new Subscription(this.api, subscriptionData)

    subscriptionData.categories.each(function(category) {
      if(category.label) {
        this.folders.addSubscription(category.id, category.label, subscription)
      }
    }.bind(this))
  },

  addUnreadCounts: function(success, failure) {
    var onSuccess = function(counts) {
      counts.each(function(count) {
        if(count.id.startsWith("feed")) {
          this.incrementUnreadCountBy(count.count)

          this.items.each(function(item) {
            if(item.id == count.id) {
              item.setUnreadCount(count.count)
            }
          })

          this.folders.addUnreadCounts(count)
        }
      }.bind(this))

      this.sort(success, failure)
    }.bind(this)

    this.api.getUnreadCounts(onSuccess, failure)
  },

  sort: function(success, failure) {
    var manualSort = function(sortOrder) {
      var sortedKeys = []

      sortOrder.toArray().eachSlice(8, function(key) {
        sortedKeys.push(key.join(""))
      })

      console.log(sortedKeys.length)
      for(var i = 0; i < sortedKeys.length; i++) {
        for(var j = 0; j < this.items.length; j++) {
          if(this.items[j].sortId == sortedKeys[i]) {
            this.items[j].sortId = i
            break
          }
        }
      }

      this.items = this.items.sortBy(function(s){return s.sortId})

      success()
    }.bind(this)

    if(Preferences.isManualFeedSort()) {
      this.items.push.apply(this.items, this.folders.items)
      this.folders.items.clear()
      this.items.each(function(item){item.divideBy = "Subscriptions"})
      this.api.getSortOrder(manualSort, failure)
    }
    else {
      success()
    }
  }
})