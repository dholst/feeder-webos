var Subscriptions = Class.create({
  initialize: function(api) {
    this.api = api
    this.folders = new Folders(api)
    this.items = []
    this.unreadCount = 0
  },
  
  findAll: function(success, failure) {
    var onSuccess = function(subscriptions) {
      this.items.clear()
      
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
          this.unreadCount += count.count

          this.items.each(function(item) {
            if(item.id == count.id) {
              item.unreadCount = count.count
            }
          })

          this.folders.addUnreadCounts(count)
          
        }
      }.bind(this))
      
      this.filterItems()
      success()
    }.bind(this)
    
    this.api.getUnreadCounts(onSuccess, failure)
  },
  
  filterItems: function() {
    var filtered = $A(this.items).select(function(item){return item.unreadCount})
    this.items.clear()
    this.items.push.apply(this.items, filtered)
  }
})