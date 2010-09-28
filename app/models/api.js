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
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().subscriptions)}
    })
  },

  getUnreadCounts: function(success, failure) {
    new Ajax.Request(Api.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().unreadcounts)}
    })
  },
  
  getAllArticles: function(continuation, success, failure) {
    this._getArticles("user/-/state/com.google/reading-list", continuation, success, failure)
  },
  
  getAllStarred: function(continuation, success, failure) {
    this._getArticles("user/-/state/com.google/starred", continuation, success, failure)
  },
  
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(id, continuation, success, failure)
  },
  
  _getArticles: function(id, continuation, success, failure) {
    var parameters = {output: "json", n: 50, r: "o", xt: "user/-/state/com.google/read"}
    
    if(continuation) {
      parameters.c = continuation
    }
    
    new Ajax.Request(Api.BASE_URL + "stream/contents/" + id, {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var articles = response.responseText.evalJSON()
        success(articles.items, articles.id, articles.continuation)
      }
    })
  },

  setArticleUnread: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId, 
      subscriptionId, 
      "user/-/state/com.google/kept-unread", 
      "user/-/state/com.google/read", 
      success
    )
  },
  
  setArticleRead: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId, 
      subscriptionId, 
      "user/-/state/com.google/read", 
      null, 
      success
    )
  },
  
  _editTag: function(articleId, subscriptionId, addTag, removeTag, success) {
    Log.debug("editing tag for article id = " + articleId + " and subscription id = " + subscriptionId)
    
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        i: articleId,
        s: subscriptionId
      }
      
      if(addTag) parameters.a = addTag
      if(removeTag) parameters.r = removeTag

      new Ajax.Request(Api.BASE_URL + "edit-tag", {
        method: "post",
        parameters:  parameters,
        requestHeaders: this._requestHeaders(),
        onSuccess: success
      })
    }.bind(this))
  },
  
  _requestHeaders: function() {
    return {Authorization:"GoogleLogin auth=" + this.auth}  
  },
  
  _getEditToken: function(success) {
    if(this.editToken) {
      Log.debug("using last edit token - " + this.editToken)
      success(this.editToken)
    }
    else {
      var parameters = {
        
      }
      
      new Ajax.Request(Api.BASE_URL + "token", {
        method: "get",
        parameters: parameters,
        requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
        onSuccess: function(response) {
          this.editToken = response.responseText
          Log.debug("retrieved edit token - " + this.editToken)
          success(this.editToken)
        }.bind(this)
        
      })
    }
  }
})

Api.BASE_URL = "http://www.google.com/reader/api/0/"