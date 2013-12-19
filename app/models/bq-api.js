var BQApi = Class.create({
  //UPDATED 1.0.1
  login: function(credentials, success, failure) {
    var authSuccess = function(response) {
      var authMatch = response.responseText.match(/Auth\=(.*)/)
      this.auth = authMatch ? authMatch[1] : ''
      success(this.auth)
    }.bind(this)

    new Ajax.Request("https://www.bazqux.com/accounts/ClientLogin", {
      method: "post",
      parameters: {Email: credentials.email, Passwd: credentials.password},
      onSuccess: authSuccess,
      onFailure: failure
    })
  },

  //UPDATED 1.0.1
  getTags: function(success, failure) {
    new Ajax.Request(BQApi.BASE_URL + "tag/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().tags)}
    })
  },

  //UPDATED 1.0.1
  getSortOrder: function(success, failure) {
    new Ajax.Request(BQApi.BASE_URL + "preference/stream/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var prefs = response.responseText.evalJSON()
        var sortOrder = {}

        if(prefs && prefs.streamprefs) {
          $H(prefs.streamprefs).each(function(pair) {
            pair.key = pair.key.gsub(/user\/\d+\//, "user/-/")

            $A(pair.value).each(function(pref) {
              if("subscription-ordering" == pref.id) {
                sortOrder[pair.key] = new SortOrder(pref.value)
              }
            })
          })
        }

        success(sortOrder)
      }
    })
  },

  //UPDATED 1.0.1
  setSortOrder: function(sortOrder, stream) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(BQApi.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },

  //UPDATED 1.0.1
  unsubscribe: function(feed) {
    if(feed.constructor == Folder) {
      this.removeLabel(feed)
    }
    else {
      this._getEditToken(function(token) {
        var parameters = {
          T: token,
          s: feed.id,
          ac: "unsubscribe",
          t: feed.title
        }

        new Ajax.Request(BQApi.BASE_URL + "subscription/edit", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: function() {Mojo.Event.send(document, "SubscriptionDeleted", {id: feed.id, count: feed.unreadCount})}
        })
      }.bind(this))
    }
  },

  //UPDATED 1.0.1
  removeLabel: function(folder) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: folder.id,
        t: folder.title
      }

      new Ajax.Request(BQApi.BASE_URL + "disable-tag", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onSuccess: function() {Mojo.Event.send(document, "FolderDeleted", {id: folder.id})}
      })
    }.bind(this))
  },

  //NOT CURRENTLY SUPPORTED BY API
  searchSubscriptions: function(query, success, failure) {
	failure()
//     var self = this
// 
//     new Ajax.Request(BQApi.BASE_URL + "feed-finder", {
//       method: "get",
//       parameters: {q: query, output: "json"},
//       requestHeaders: this._requestHeaders(),
//       onFailure: failure,
//       onSuccess: function(response) {
//         var subscriptions = response.responseText.evalJSON().items
//         success(subscriptions)
//       }
//     })
  },

  //UPDATED 1.0.1
  addSubscription: function(url, success, failure) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        quickadd: url
      }

      new Ajax.Request(BQApi.BASE_URL + "subscription/quickadd", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onFailure: failure,
        onSuccess: function(response) {
          var json = response.responseText.evalJSON()

          if(json.streamId) {
            success()
          }
          else {
            failure()
          }
        }
      })
    }.bind(this))
  },

  //UPDATED 1.0.1
  getAllSubscriptions: function(success, failure) {
    var self = this

    new Ajax.Request(BQApi.BASE_URL + "subscription/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON().subscriptions
        self.cacheTitles(subscriptions)
        success(subscriptions)
      }
    })
  },

  //UPDATED 1.0.1
  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },

  //UPDATED 1.0.1
  titleFor: function(id) {
    return this.titles[id]
  },

  //UPDATED 1.0.1
  getUnreadCounts: function(success, failure) {
    new Ajax.Request(BQApi.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var json = response.responseText.evalJSON()

        if(json.denied) {
          failure()
        }
        else {
          success(json.unreadcounts)
        }
      }
    })
  },

  //UPDATED 1.0.1
  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/reading-list",
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/starred",
      null,
      continuation,
      success,
      failure
    )
  },

  //NOT CURRENTLY SUPPORTED BY API
  getAllShared: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/broadcast",
      null,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  _getArticles: function(id, exclude, continuation, success, failure) {
    var parameters = {output: "json", n: 40}

    if(id != "user/-/state/com.google/starred" &&
       id != "user/-/state/com.google/broadcast" &&
       Preferences.isOldestFirst()) {
      parameters.r = "o"
    }

    if(continuation) {
      parameters.c = continuation
    }

    if(exclude) {
      parameters.xt = exclude
    }

    new Ajax.Request(BQApi.BASE_URL + "stream/contents/" + escape(id), {
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

  //UPDATED 1.0.1
  markAllRead: function(id, success, failure) {
    this._getEditToken(
      function(token) {
        var parameters = {
          T: token,
          s: id
        }

        new Ajax.Request(BQApi.BASE_URL + "mark-all-as-read", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: success,
          onFailure: failure
        })
      }.bind(this),

      failure
    )
  },

  //NOT CURRENTLY SUPPORTED BY API
  search: function(query, id, success, failure) {
    var parameters = {
      q: query,
      num: 50,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

    new Ajax.Request(BQApi.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: failure
    })
  },

  //NOT CURRENTLY SUPPORTED BY API
  searchItemsFound: function(success, failure, response) {
    var self = this
    var ids = response.responseText.evalJSON().results

    if(ids.length) {
      self._getEditToken(
        function(token) {
          var parameters = {
            T: token,
            i: ids.map(function(n) {return n.id})
          }

          new Ajax.Request(BQApi.BASE_URL + "stream/items/contents", {
            method: "post",
            parameters: parameters,
            requestHeaders: self._requestHeaders(),
            onFailure: failure,
            onSuccess: function(response) {
              var articles = response.responseText.evalJSON()
              success(articles.items, articles.id, articles.continuation)
            }
          })
        }
      )
    }
    else {
      success([], "", false)
    }
  },

  //NOT CURRENTLY SUPPORTED BY API
  mapSearchResults: function(response) {
    console.log(response.responseText)
  },

  //UPDATED 1.0.1
  setArticleRead: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/read",
      null,
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
     this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/read",
      success,
      failure
    )
  },

  //NOT CURRENTLY SUPPORTED BY API
  setArticleShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/broadcast",
      null,
      success,
      failure
    )
  },

  //NOT CURRENTLY SUPPORTED BY API
  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/broadcast",
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  setArticleStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/starred",
      null,
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/starred",
      success,
      failure
    )
  },

  //UPDATED 1.0.1
  _editTag: function(articleId, subscriptionId, addTag, removeTag, success, failure) {
    Log.debug("editing tag for article id = " + articleId + " and subscription id = " + subscriptionId)

    this._getEditToken(
      function(token) {
        var parameters = {
          T: token,
          i: articleId,
          s: subscriptionId
        }

        if(addTag) parameters.a = addTag
        if(removeTag) parameters.r = removeTag

        new Ajax.Request(BQApi.BASE_URL + "edit-tag", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: success,
          onFailure: failure
        })
      }.bind(this),

      failure
    )
  },

  //UPDATED 1.0.1
  _requestHeaders: function() {
    return {Authorization:"GoogleLogin auth=" + this.auth}
  },

  //UPDATED 1.0.1
  _getEditToken: function(success, failure) {
    if(this.editToken && (new Date().getTime() - this.editTokenTime < 120000)) {
      Log.debug("using last edit token - " + this.editToken)
      success(this.editToken)
    }
    else {
      new Ajax.Request(BQApi.BASE_URL + "token", {
        method: "get",
        requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
        onFailure: failure,
        onSuccess: function(response) {
          this.editToken = response.responseText
          this.editTokenTime = new Date().getTime()
          Log.debug("retrieved edit token - " + this.editToken)
          success(this.editToken)
        }.bind(this)
      })
    }
  },

  //UPDATED 1.0.1  
  supportsAllArticles: function() {
	return true
  },

  //UPDATED 1.0.1  
  supportsStarred: function() {
	return true
  },
  
  //UPDATED 1.0.1
  supportsShared: function() {
	return false
  },

  //UPDATED 1.0.1  
  supportsSearch: function() {
	return false
  },
  
  //UPDATED 1.0.1
  supportsManualSort: function() {
	return true
  }
  
})

BQApi.BASE_URL = "https://www.bazqux.com/reader/api/0/"