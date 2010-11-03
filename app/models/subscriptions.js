var Subscriptions = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.originalItems = []
    this.filteredItems = []
  },

  findAll: function(success, failure) {
    var onSuccess = function(subscriptions) {
      this.clearUnreadCount()
      this.originalItems.clear()
      this.filteredItems.clear()

      var folders = new Folders(this.api)

      subscriptions.each(function(subscriptionData) {
        var subscription = new Subscription(this.api, subscriptionData)

        if(subscription.belongsToFolder()) {
          this.addSubscriptionToFolders(folders, subscription)
        }
        else {
          this.originalItems.push(subscription)
        }
      }.bind(this))

      this.originalItems.push.apply(this.originalItems, folders.items)
      this.addUnreadCounts(success, failure)
    }.bind(this)

    this.api.getAllSubscriptions(onSuccess, failure)
  },

  addSubscriptionToFolders: function(folders, subscription) {
    subscription.categories.each(function(category) {
      if(category.label) {
        folders.addSubscription(category.id, category.label, subscription)
      }
    })
  },

  addUnreadCounts: function(success, failure) {
    var onSuccess = function(counts) {
      counts.each(function(count) {
        if(count.id.startsWith("feed")) {
          this.incrementUnreadCountBy(count.count)

          this.originalItems.each(function(item) {
            if(item.id == count.id) {
              item.setUnreadCount(count.count)
            }

            if(item.isFolder) {
              item.addUnreadCount(count)
            }
          })
        }
      }.bind(this))

      this.sort(success, failure)
    }.bind(this)

    this.api.getUnreadCounts(onSuccess, failure)
  },

  sort: function(success, failure) {
    if(Preferences.isManualFeedSort()) {
      this.sortManually(success, failure)
    }
    else {
      this.sortAlphabetically(success, failure)
    }
  },

  sortManually: function(success, failure) {
    var addSortIdsToFolders = function(tags) {
      tags.each(function(tag) {
        var folder = this.originalItems.find(function(item) {return item.id == tag.id})
        if(folder) folder.sortId = tag.sortid
      }.bind(this))

      this.api.getSortOrder(this.manuallySort.bind(this, success, failure))
    }.bind(this)

    this.api.getTags(addSortIdsToFolders, failure)
  },

  sortAlphabetically: function(success, failure) {
    this.originalItems = this.originalItems.sortBy(function(item){return (item.isFolder ? "__FOLDER_" : "__SUBSCRIPTION_") + item.title.toUpperCase()})
    success()
  },

  manuallySort: function(success, failure, sortOrder) {
    sortOrder.toArray().inGroupsOf(8).each(function(key, index) {
      key = key.join("")
      var sortedItem = this.originalItems.find(function(item) {return item.sortId == key})
      if(sortedItem) sortedItem.sortNumber = index
    }.bind(this))

    var sortedItems = this.originalItems.sortBy(function(item){return item.sortNumber})
    this.originalItems.clear()
    this.originalItems.push.apply(this.originalItems, sortedItems)

    success()
  }
})