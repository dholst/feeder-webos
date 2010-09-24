var Subscription = Class.create({
  initialize: function(api, data) {
    this.api = api
    this.id = data.id
    this.title = data.title
    this.icon = "rss"
    this.divideBy = "Subscriptions"
    this.unreadCount = 0
    this.continuation = false
    this.items = []
  },
  
  findArticles: function(success, failure) {
    var onSuccess = function(articles, continuation) {
      Log.debug("continuation token is " + continuation)
      this.continuation = continuation
      
      if(this.items.length && this.items[this.items.length - 1].load_more) {
        this.items.pop()
      }
      
      $A(articles).each(function(articleData) {
        this.items.push(new Article(articleData))
      }.bind(this))
      
      if(this.continuation) {
        this.items.push(new LoadMore())
      }
      
      success()
    }.bind(this)
    
    this.api.getAllArticlesFor(this.id, this.continuation, onSuccess, failure)
  }
})