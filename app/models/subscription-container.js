var SubscriptionContainer = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.items = []
    this.api = api
  },
  
  remove: function(subscription) {
    var self = this

    self.items.each(function(item, index) {
      if(item.id == subscription.id) {
        self.items.splice(index, 1)
        self.api.unsubscribe(subscription)
        throw $break
      }
    })
  },

  move: function(subscription, beforeSubscription) {
    var self = this

    self.items.each(function(item, index) {
      if(item.id == subscription.id) {
        Log.debug("removing " + subscription.id + " at index " + index)
        self.items.splice(index, 1)
        throw $break
      }
    })

    if(beforeSubscription) {
      self.items.each(function(item, index) {
        if(item.id == beforeSubscription.id) {
          Log.debug("inserting " + subscription.id + " at index " + index)
          self.items.splice(index, 0, subscription)
          throw $break
        }
      })
    }
    else {
      self.items.push(subscription)
    }

    var sortOrder = self.items.map(function(subscription) {return subscription.sortId}).join("")
    this.api.setSortOrder(sortOrder, this.subscriptionOrderingStream)
  }
})