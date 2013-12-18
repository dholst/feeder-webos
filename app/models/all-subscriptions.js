var AllSubscriptions = Class.create(SubscriptionContainer, {
  findAll: function(success, failure) {
    var self = this

    self.api.getAllSubscriptions(
      function(subscriptions) {
        self.sorted = false
        self.clearUnreadCount()
        self.items.clear()

        var folders = new Folders(self.api)

        subscriptions.each(function(subscriptionData) {
          var subscription = new Subscription(self.api, subscriptionData)
          self.addSubscription(subscription, folders)
        })

        folders.addSortIds(
          function() {
            self.items.push.apply(self.items, folders.items)
            self.addUnreadCounts(success, failure)
          },

          failure
        )
      },

      failure
    )
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

  addUnreadCounts: function(success, failure) {
    var self = this

    self.api.getUnreadCounts(
      function(counts) {
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

        success()
      },

      failure
    )
  },

  sort: function(success, failure) {
    var self = this
    if(Preferences.isManualFeedSort()) {
      if (self.api.supportsManualSort())
      {
      	this.sortManually(success, failure)
      }
      else
      {
      	Feeder.notify($L("Manual Sort Not Available"))
      	Preferences.setManualFeedSort(false)
      	this.sortAlphabetically(success, failure)
      }
    }
    else {
      
      this.sortAlphabetically(success, failure)
    }
  },

  sortAlphabetically: function(success) {
    var self = this

    if(self.sorted == "alphabetic") {
      success()
    }
    else {
      self.items.each(function(item) {
        if(item.isFolder) item.sortAlphabetically()
      })

      self.sortBy(function(item) {
        return (item.isFolder ? "__FOLDER_" : "__SUBSCRIPTION_") + item.title.toUpperCase()
      })

      self.sorted = "alphabetic"
      success()
    }
  },

  sortManually: function(success, failure) {
    var self = this

    if(self.sorted == "manual") {
      success()
    }
    else {
      self.api.getSortOrder(
        function(sortOrders) {
          var rootSortOrder = sortOrders["user/-/state/com.google/root"] || new SortOrder("")

          self.items.each(function(item) {
            item.sortNumber = rootSortOrder.getSortNumberFor(item.sortId)
            if(item.isFolder) item.sortManually(sortOrders[item.id.gsub(/user\/\d+\//, "user/-/")])
          })

          self.sortBy(function(item) {
            return item.sortNumber
          })

          self.sorted = "manual"
          success()
        },

        failure
      )
    }
  },

  sortBy: function(f) {
    var sortedItems = this.items.sortBy(f)
    this.items.clear()
    this.items.push.apply(this.items, sortedItems)
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