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

  getTags: function(success, failure) {
    new Ajax.Request(Api.BASE_URL + "tag/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().tags)}
    })
  },

  getSortOrder: function(success, failure) {
    new Ajax.Request(Api.BASE_URL + "preference/stream/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var prefs = response.responseText.evalJSON()
        var sortOrder = false

        if(prefs && prefs.streamprefs) {
          for(key in prefs.streamprefs) {
            if(key.match(/user\/.*\/state\/com\.google\/root/)) {
              $A(prefs.streamprefs[key]).each(function(pref) {
                if("subscription-ordering" == pref.id) {
                  sortOrder = pref.value
                }
              })
            }
          }
        }

        success(sortOrder.toArray().inGroupsOf(8).map(function(key){return key.join("")}))
      }
    })
  },

  setSortOrder: function(sortOrder) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(Api.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },

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

        new Ajax.Request(Api.BASE_URL + "subscription/edit", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders()
        })
      }.bind(this))
    }
  },

  removeLabel: function(folder) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: folder.id,
        t: folder.title
      }

      new Ajax.Request(Api.BASE_URL + "disable-tag", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },

  addSubscription: function(url, success, failure) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        quickadd: url
      }

      new Ajax.Request(Api.BASE_URL + "subscription/quickadd", {
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

  getAllSubscriptions: function(success, failure) {
    // success(STATIC_SUBSCRIPTIONS.subscriptions)
    new Ajax.Request(Api.BASE_URL + "subscription/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().subscriptions)}
    })
  },

  getUnreadCounts: function(success, failure) {
    // success(STATIC_UNREAD_COUNTS.unreadcounts)
    new Ajax.Request(Api.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().unreadcounts)}
    })
  },

  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/reading-list",
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/starred",
      null,
      continuation,
      success,
      failure
    )
  },

  getAllShared: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/broadcast",
      null,
      continuation,
      success,
      failure
    )
  },

  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

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

    new Ajax.Request(Api.BASE_URL + "stream/contents/" + escape(id), {
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

  markAllRead: function(id, success) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: id
      }

      new Ajax.Request(Api.BASE_URL + "mark-all-as-read", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onSuccess: success
      })
    }.bind(this))
  },

  setArticleRead: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/read",
      "user/-/state/com.google/kept-unread",
      success
    )
  },

  setArticleNotRead: function(articleId, subscriptionId, success, sticky) {
    this._editTag(
      articleId,
      subscriptionId,
      sticky ? "user/-/state/com.google/kept-unread" : null,
      "user/-/state/com.google/read",
      success
    )
  },

  setArticleShared: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/broadcast",
      null,
      success
    )
  },

  setArticleNotShared: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/broadcast",
      success
    )
  },

  setArticleStarred: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/starred",
      null,
      success
    )
  },

  setArticleNotStarred: function(articleId, subscriptionId, success) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/starred",
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

      console.log(Object.toJSON(parameters))

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
    if(this.editToken && (new Date().getTime() - this.editTokenTime < 120000)) {
      Log.debug("using last edit token - " + this.editToken)
      success(this.editToken)
    }
    else {
      new Ajax.Request(Api.BASE_URL + "token", {
        method: "get",
        requestHeaders: {Authorization:"GoogleLogin auth=" + this.auth},
        onSuccess: function(response) {
          this.editToken = response.responseText
          this.editTokenTime = new Date().getTime()
          Log.debug("retrieved edit token - " + this.editToken)
          success(this.editToken)
        }.bind(this)

      })
    }
  }
})

Api.BASE_URL = "http://www.google.com/reader/api/0/"