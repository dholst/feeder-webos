var AolApi = Class.create({
  //UPDATED 1.2.0
  login: function(credentials, success, failure, controller) {
    if (credentials.accessToken != null && credentials.refreshToken != null && credentials.tokenExpiry != null)
    {
    	this.credentials = credentials
    	if (this._checkTokenExpiry())
    	{
    		success(this.credentials.accessToken)
    	}
    	else
    	{
    		this.credentials.password = null
      		this.credentials.server = null
      		this.credentials.id = null
	  		this.credentials.refreshToken = null
	  		this.credentials.accessToken = null
	  		this.credentials.tokenType = null
	  		this.credentials.plan = null
      		this.credentials.clear()
    		failure()
    		return
    	}
    }
    else
    { 
		var oauthConfig={
			callbackScene:'login', //Name of the assistant to be called on the OAuth Success
			authorizeUrl: AolApi.AUTH_URL + 'authorize',
			accessTokenUrl: AolApi.AUTH_URL + 'access_token',
			accessTokenMethod:'POST', // Optional - 'GET' by default if not specified
			client_id: AolApi.CLIENT_ID,
			client_secret: AolApi.CLIENT_SECRET,
			redirect_uri:'urn:ietf:wg:oauth:2.0:oob', // Optional - 'oob' by default if not specified
			response_type:'code', // now only support code
			scope: ['reader'], //for example, this is instagram scope
			service: credentials.service
		 };
		 controller.stageController.pushScene('oauth',oauthConfig);
	 }
  },

  //UPDATED 1.2.0
  getTags: function(success, failure) {
    new Ajax.Request(AolApi.BASE_URL + "tag/list", {
      method: "get",
      parameters: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON().tags)}
    })
  },

  //NOT SUPPORTED BY API
  getSortOrder: function(success, failure) {
	failure()
  /*  new Ajax.Request(AolApi.BASE_URL + "preference/stream/list", {
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
    })*/
  },

  //NOT SUPPORTED BY API
  setSortOrder: function(sortOrder, stream) {
	failure()
  	/*this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(AolApi.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))*/
  },

  //UPDATED 1.2.0
  unsubscribe: function(feed) {
    if(feed.constructor == Folder) {
      this.removeLabel(feed)
    }
    else {
		var parameters = {
		  access_token: this._getAuthToken(),
		  s: feed.id,
		  ac: "unsubscribe"
		}

		new Ajax.Request(AolApi.BASE_URL + "subscription/edit", {
		  method: "post",
		  parameters: parameters,
		  onSuccess: function() {Mojo.Event.send(document, "SubscriptionDeleted", {id: feed.id, count: feed.unreadCount})}
		})
    }
  },

  //UPDATED 1.2.0
  removeLabel: function(folder) {
	  var parameters = {
		access_token: this._getAuthToken(),
		s: folder.id
	  }

	  new Ajax.Request(AolApi.BASE_URL + "disable-tag", {
		method: "post",
		parameters: parameters,
		onSuccess: function() {Mojo.Event.send(document, "FolderDeleted", {id: folder.id})}
	  })
  },

  //NOT SUPPORTED BY API
  searchSubscriptions: function(query, success, failure) {	
    failure()
    /*var self = this

    new Ajax.Request(AolApi.BASE_URL + "feed-finder", {
      method: "get",
      parameters: {q: query, output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON().items
        success(subscriptions)
      }
    })*/
  },

  //UPDATED 1.2.0
  addSubscription: function(url, success, failure) {
      var parameters = {
        access_token: this._getAuthToken(),
        quickadd: url
      }

      new Ajax.Request(AolApi.BASE_URL + "subscription/quickadd", {
        method: "post",
        parameters: parameters,
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
  },

  //UPDATED 1.2.0
  getAllSubscriptions: function(success, failure) {
    var self = this

    new Ajax.Request(AolApi.BASE_URL + "subscription/list", {
      method: "get",
      parameters: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON().subscriptions
        self.cacheTitles(subscriptions)
        success(subscriptions)
      }
    })
  },

  //UPDATED 1.2.0
  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },

  //UPDATED 1.2.0
  titleFor: function(id) {
    return this.titles[id]
  },

  //UPDATED 1.2.0
  getUnreadCounts: function(success, failure) {
    new Ajax.Request(AolApi.BASE_URL + "unread-count", {
      method: "get",
      parameters: this._requestHeaders(),
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

  //UPDATED 1.2.0
  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/reading-list",
      Preferences.hideReadArticles() ? "user/-/state/read" : null,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.2.0
  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/starred",
      null,
      continuation,
      success,
      failure
    )
  },

  //NOT SUPPORTED BY API
  getAllShared: function(continuation, success, failure) {
    failure()
    /*this._getArticles(
      "user/-/state/com.google/broadcast",
      null,
      continuation,
      success,
      failure
    )*/
  },

  //UPDATED 1.2.0
  getAllFresh: function(continuation, success, failure) {
    /*this._getArticles(
      -3,
      "all_articles",
      continuation,
      success,
      failure
    )*/
  },

  //UPDATED 1.2.0
  getAllArchived: function(continuation, success, failure) {
    /*this._getArticles(
      -0,
      "all_articles",
      continuation,
      success,
      failure
    )*/
  },

  //UPDATED 1.2.0
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? "user/-/state/read" : null,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.2.0
  _getArticles: function(id, exclude, continuation, success, failure) {
    var parameters = {output: "json", n: 40, access_token: this._getAuthToken()}

    if(id != "user/-/state/starred" &&
       Preferences.isOldestFirst()) {
      parameters.r = "o"
    }

    if(continuation) {
      parameters.c = continuation
    }

    if(exclude) {
      parameters.xt = exclude
    }

    new Ajax.Request(AolApi.BASE_URL + "stream/contents/" + escape(id), {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var articles = JSON2.parse(response.responseText)
        
        //Post Processing
        articles.items.each(function(item){
        	item.crawlTimeMsec = item.crawlTimeMsec.substring(0, item.crawlTimeMsec.length - 3)
        	item.alternate.each(function(alternate){
        		alternate.type = "html"
        	})
       	    item.categories.each(function(category) {
				if(category.endsWith("/state/read")) {
					item.categories.push("/state/com.google/read")
				}

				if(category.endsWith("/state/kept-unread")) {
					item.categories.push("/state/com.google/kept-unread")
				}

				if(category.endsWith("/state/starred")) {
					item.categories.push("/state/com.google/starred")
				}	
			})
        })
        
        //Load more articles (if there are more to load)
		if(articles.items.length == parameters.n)
		{
			success(articles.items, articles.id, articles.continuation)
		}
		else
		{
			success(articles.items, articles.id, false)
		}
      }
    })
  },

  //UPDATED 1.2.0
  markAllRead: function(id, success, failure) {
	if (id === "user/-/state/com.google/reading-list") {
		id = "user/-/state/reading-list"
	}
	
	var parameters = {
	  access_token: this._getAuthToken(),
	  s: id
	}

	new Ajax.Request(AolApi.BASE_URL + "mark-all-as-read", {
	  method: "post",
	  parameters: parameters,
	  onSuccess: success,
	  onFailure: failure
	})
  },

  //NOT SUPPORTED BY API
  search: function(query, id, success, failure) {
  	failure()
    /*var parameters = {
      q: query,
      num: 50,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

    new Ajax.Request(AolApi.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: failure
    })*/
  },

  //NOT SUPPORTED BY API
  searchItemsFound: function(success, failure, response) {
  	failure()
    /*var self = this
    var ids = response.responseText.evalJSON().results

    if(ids.length) {
      self._getEditToken(
        function(token) {
          var parameters = {
            T: token,
            i: ids.map(function(n) {return n.id})
          }

          new Ajax.Request(AolApi.BASE_URL + "stream/items/contents", {
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
    }*/
  },

  //UPDATED 1.2.0
  mapSearchResults: function(response) {
    console.log(response.responseText)
  },

  //UPDATED 1.2.0
  setArticleRead: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/read",
      null,
      success,
      failure
    )
  },

  //UPDATED 1.2.0
  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
     this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/read",
      success,
      failure
    )
  },

  //NOT SUPPORTED BY API
  setArticleShared: function(articleId, subscriptionId, success, failure) {
    failure()
    /*this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/broadcast",
      null,
      success,
      failure
    )*/
  },

  //NOT SUPPORTED BY API
  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
    failure()
    /*this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/broadcast",
      success,
      failure
    )*/
  },

  //UPDATED 1.2.0
  setArticleStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/starred",
      null,
      success,
      failure
    )
  },

  //UPDATED 1.2.0
  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/starred",
      success,
      failure
    )
  },

  //UPDATED 1.2.0
  _editTag: function(articleId, subscriptionId, addTag, removeTag, success, failure) {
    Log.debug("editing tag for article id = " + articleId + " and subscription id = " + subscriptionId)
        var parameters = {
          access_token: this._getAuthToken(),
          ac: "edit",
          i: articleId
        }

        if(addTag) parameters.a = addTag
        if(removeTag) parameters.r = removeTag

        new Ajax.Request(AolApi.BASE_URL + "edit-tag", {
          method: "post",
          parameters: parameters,
          onSuccess: success,
          onFailure: failure
        })
  },

  //UPDATED 1.2.0
  _requestHeaders: function() {
    return {access_token: this._getAuthToken()}
  },
  
  //UPDATED 1.2.0
  _getAuthToken: function() {
    if (this._checkTokenExpiry())
    {
    	return this.credentials.accessToken
    }
    else
    {
    	return "OAuth Error"
    }
  },

  //UPDATED 1.2.0  
  _serialize: function(obj) {
	  var str = []
	  for(var p in obj)
	  {
		if (obj.hasOwnProperty(p)) {
		  str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
		}
	  }
	  return str.join("&")
  },

  //UPDATED 1.2.0
  _checkTokenExpiry: function() {
    if (new Date(this.credentials.tokenExpiry).getTime() > new Date().getTime())
    {
    	return true
    } 
    else
    {
    	var parameters = {
    		grant_type: "refresh_token",
    		refresh_token: this.credentials.refreshToken,
        	client_id: AolApi.CLIENT_ID,
        	client_secret: AolApi.CLIENT_SECRET
    	}

    	try {
        	var req = new XMLHttpRequest()
        	req.open("POST", AolApi.AUTH_URL + "access_token", false)
        	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        	req.send(this._serialize(parameters))
			if(req.readyState === 4 && req.status === 200){
				response = req.responseText.evalJSON()
				if (response) {
					if (response.access_token) {
						this.credentials.accessToken = response.access_token
					}
					if (response.expires_in) {
						var expiryDate = new Date();
						expiryDate.setSeconds(expiryDate.getSeconds() + response.expires_in);
						this.credentials.tokenExpiry = expiryDate
					}
					if (response.token_type) {
						this.credentials.tokenType = response.token_type
					}
					this.credentials.save()
					return true
				}
				else
				{
					return false
				}
			} 
			else
			{
				throw req.responseText
			}
    	}
    	catch (e) {
        	Log.debug('_checkTokenExpiry failed! Error:' + e)
        	return false
    	}
	}
  },

  //UPDATED 1.2.0  
  supportsAllArticles: function() {
	return true
  },
  
  //UPDATED 1.2.0  
  supportsArchived: function() {
	return false
  },
  
  //UPDATED 1.2.0  
  supportsFresh: function() {
	return false
  },

  //UPDATED 1.2.0  
  supportsStarred: function() {
	return true
  },

  //UPDATED 1.2.0  
  supportsShared: function() {
	return false
  },

  //UPDATED 1.2.0  
  supportsSearch: function() {
	return false
  },
  
  //UPDATED 1.2.0
  supportsManualSort: function() {
	return false
  }
  
})

AolApi.BASE_URL = "https://reader.aol.com/reader/api/0/"
AolApi.AUTH_URL = "https://api.screenname.aol.com/auth/"
AolApi.CLIENT_ID = "fe1CgOIzMHHjg_5E";
AolApi.CLIENT_SECRET = "2fHTh5uZTiUOsy-gs_l3";