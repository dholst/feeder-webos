var AllSources = Class.create({
  initialize: function(api) {
    this.subscriptions = new Subscriptions(api)
    this.items = []
  },
  
  findAll: function(success, failure) {
    this.items = []
    this.subscriptions.findAll(this.foundSubscriptions.bind(this, success, failure), failure)
  },
  
  foundSubscriptions: function(success, failure) {
    this.subscriptions.items.each(function(subscription) {
      subscription.divideBy = "Subscriptions"
      subscription.icon = "rss"
      this.items.push(subscription)
    }.bind(this))
    
    success()
  }
}) 