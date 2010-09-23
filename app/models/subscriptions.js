var Subscriptions = Class.create({
  initialize: function(api) {
    this.api = api
    this.items = []
  },
  
  findAll: function(success, failure) {
    var onSuccess = function(subscriptions) {
      this.items.clear()
      
      subscriptions.each(function(subscriptionData) {
        this.items.push(new Subscription(this.api, subscriptionData))
      }.bind(this))
      
      this.addUnreadCounts(success, failure)
    }.bind(this)
    
    this.api.getAllSubscriptions(onSuccess, failure)
  },
  
  addUnreadCounts: function(success, failure) {
    var onSuccess = function(counts) {
      this.items.each(function(item){
        item.klass = "read"
        
        counts.each(function(count) {
          if(item.id == count.id) {
            item.setUnreadCount(count.count)
            return
          }
        })
      })
      
      // this.filterItems()
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