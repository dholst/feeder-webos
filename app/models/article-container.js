var ArticleContainer = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.continuation = false
    this.items = [] 
  },

  reset: function() {
    this.items.clear()
    this.continuation = false
  },
  
  findArticles: function(success, failure) {
    var onSuccess = function(articles, id, continuation) {
      Log.debug("continuation token is " + continuation)
      
      this.continuation = continuation
      
      if(this.items.length && this.items[this.items.length - 1].load_more) {
        this.items.pop()
      }
      
      $A(articles).each(function(articleData) {
        this.items.push(new Article(articleData, this))
      }.bind(this))
      
      if(this.continuation) {
        this.items.push(new LoadMore())
      }
      
      success()
    }.bind(this)
    
    this.makeApiCall(this.continuation, onSuccess, failure)
  }  
})