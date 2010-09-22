var Subscriptions = Class.create({
  initialize: function(api) {
    this.api = api
    this.items = []
    // this.items = $A(data.items).map(function(item) {return new Subscription(item)})
  },
  
  findAll: function(success, failure) {
    var onSuccess = function(response) {
      this.items.clear
      
      response.items.each(function(item) {
        this.items.push(new Subscription(item))
      }.bind(this))
      
      this.addUnreadCounts(success, failure)
    }
    
    this.api.getAllSubscriptions(onSuccess, failure)
  }
  
  addUnreadCounts: function(success, failure) {
    var onSuccess = function(counts) {
      this.items.each(function(item){
        counts.each(function(count) {
          if(item.id == count.id) {
            item.unreadCount = count.count
            return
          }
        })
      })
      
      success(this)
    }.bind(this)
    
    this.api.getUnreadCounts(onSuccess, failure)
  }
})