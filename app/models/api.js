var Api = Class.create({
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
  
  getAllSubscriptions: function(success, failure) {
    new Ajax.Request(Api.BASE_URL + "subscription/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().subscriptions)}
    })
  },

  getUnreadCounts: function(success, failure) {
    new Ajax.Request(Api.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().unreadcounts)}
    })
  },
  
  getAllArticlesFor: function(id, continuation, success, failure) {
    var parameters = {output: "json", n: 50, r: "o", xt: "user/-/state/com.google/read"}
    
    if(continuation) {
      parameters.c = continuation
    }
    
    new Ajax.Request(Api.BASE_URL + "stream/contents/" + id, {
      method: "get",
      parameters: parameters,
      requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
      onFailure: failure,
      onSuccess: function(response) {
        var articles = response.responseText.evalJSON()
        success(articles.items, articles.continuation)
      }
    })
  }
})

Api.BASE_URL = "http://www.google.com/reader/api/0/"