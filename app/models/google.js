var Google = Class.create({
  login: function(credentials, success, failure) {
    var authSuccess = function(response) {
      var authMatch = response.responseText.match(/Auth\=(.*)/)
      this.auth = authMatch ? authMatch[1] : ''
      success(this.auth)
    }.bind(this)
    
    new Ajax.Request("https://www.google.com/accounts/ClientLogin", {
      method: "get",
      parameters: {service: "reader", Email: credentials.email, Passwd: credentials.password},
      onSuccess: authSuccess,
      onFailure: failure
    })
  },
  
  allFeeds: function(success, failure) {
    new Ajax.Request(Google.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onSuccess: this.foundUnreadCounts.bind(this, success, failure),
      onFailure: failure
    })
  },
  
  foundUnreadCounts: function(success, failure, response) {
    new Ajax.Request(Google.BASE_URL + "subscription/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onSuccess: this.foundFeeds.bind(this, success, failure, response.responseText.evalJSON().unreadcounts),
      onFailure: failure
    })
  },
  
  foundFeeds: function(success, failure, unreadItems, response) {
    var feeds = response.responseText.evalJSON().subscriptions
    
    feeds.each(function(feed) {
      feed.unreadCount = 0
      
      unreadItems.each(function(unread) {
        if(unread.id == feed.id) {
          feed.unreadCount = unread.count
          return
        }
      })
    })
    
    success($A(feeds).sortBy(function(feed) {return feed.title.toUpperCase()}))
  },
  
  allFeedItems: function(feed, success, failure) {
    new Ajax.Request(Google.BASE_URL + "stream/contents/" + feed.id, {
      method: "get",
      parameters: {output: "json", n: 200, r: "o", xt: "user/-/state/com.google/read"},
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onSuccess: function(response) {success(response.responseText.evalJSON().items)},
      onFailure: failure
    })
  }
})

Google.BASE_URL = "http://www.google.com/reader/api/0/"