var FeedlyApi = Class.create({
  //UPDATED 0.9.5
  login: function(credentials, success, failure, controller) {
    if (credentials.id != null && credentials.accessToken != null && credentials.refreshToken != null && credentials.tokenExpiry != null)
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
			authorizeUrl: FeedlyApi.BASE_URL + 'auth/auth',
			accessTokenUrl: FeedlyApi.BASE_URL + 'auth/token',
			accessTokenMethod:'POST', // Optional - 'GET' by default if not specified
			client_id: FeedlyApi.CLIENT_ID,
			client_secret: FeedlyApi.CLIENT_SECRET,
			redirect_uri:'urn:ietf:wg:oauth:2.0:oob', // Optional - 'oob' by default if not specified
        	response_type:'code', // now only support code
        	scope: ['https://cloud.feedly.com/subscriptions']
	 	};
	 controller.stageController.pushScene('oauth',oauthConfig);
	 }
  },

  //UPDATED 0.9.5
  getTags: function(success, failure) {
    new Ajax.Request(FeedlyApi.BASE_URL + "tags", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {success(response.responseText.evalJSON())}
    })
  },

  //NOT CURRENTLY SUPPORTED BY API
  getSortOrder: function(success, failure) {
    new Ajax.Request(FeedlyApi.BASE_URL + "preference/stream/list", {
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

  //NOT CURRENTLY SUPPORTED BY API
  setSortOrder: function(sortOrder, stream) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(FeedlyApi.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },

  //UPDATED 0.9.5
  unsubscribe: function(feed) {
    if(feed.constructor == Folder) {
      this.removeLabel(feed)
    }
    else {
      this._ajaxDelete(FeedlyApi.BASE_URL + "subscriptions/" + encodeURIComponent(feed.id), function() {Mojo.Event.send(document, "SubscriptionDeleted", {id: feed.id, count: feed.unreadCount})}, function() {})
    }
  },

  //UPDATED 0.9.5
  removeLabel: function(folder) {
    this._ajaxDelete(FeedlyApi.BASE_URL + "categories/" + encodeURIComponent(folder.id), function() {Mojo.Event.send(document, "FolderDeleted", {id: folder.id})}, function() {})
  },

  //UPDATED 1.1.2
  searchSubscriptions: function(query, success, failure) {
    var self = this

    new Ajax.Request(FeedlyApi.BASE_URL + "search/feeds", {
      method: "get",
      parameters: {q: query, output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        //Post-processing
        var subscriptions = response.responseText.evalJSON().results
		
		subscriptions.each(function(subscription) {
		  subscription.content = {content: $L("Website") + ": " + subscription.website + ", " + $L("Subscribers") + ": " + subscription.subscribers}
		  subscription.feed = [{href: subscription.feedId.substr(5)}]
		})
        
        success(subscriptions)
      }
    })
  },

  //UPDATED 0.9.5
  addSubscription: function(url, success, failure) {
    //Get Feed Information
    new Ajax.Request(FeedlyApi.BASE_URL + "feeds/" + encodeURIComponent("feed/" + url), {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: this._processSubscription.bind(this, success, failure)
    })
  },
  
  //UPDATED 0.9.5
  _processSubscription: function(success, failure, response) {
	// Then add feed
	var feed = response.responseText.evalJSON()
	if (feed !== undefined && feed !== null && feed.id && feed.title)
	{	
		var parameters = {
			id: feed.id,
			title: feed.title
		}

		new Ajax.Request(FeedlyApi.BASE_URL + "subscriptions", {
			method: "post",
			postBody: JSON.stringify(parameters),
			requestHeaders: this._requestHeaders(),
			contentType: "application/json",
			onSuccess: success,
			onFailure: failure
		})
	}
	else
	{
		failure()
	}
  },
  
  //UPDATED 0.9.5
  getAllSubscriptions: function(success, failure) {
    var self = this

    new Ajax.Request(FeedlyApi.BASE_URL + "subscriptions", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON()
        self.cacheTitles(subscriptions)
        success(subscriptions)
      }
    })
  },

  //UPDATED 0.9.5
  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },

  //UPDATED 0.9.5
  titleFor: function(id) {
    return this.titles[id]
  },

  //UPDATED 0.9.5
  getUnreadCounts: function(success, failure) {
    new Ajax.Request(FeedlyApi.BASE_URL + "markers/counts", {
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
  
  //UPDATED 0.9.5
  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "user/" + this.credentials.id + "/category/global.all",
      Preferences.hideReadArticles() ? true : false,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 0.9.5
  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "user/" + this.credentials.id + "/tag/global.saved",
      false,
      continuation,
      success,
      failure
    )
  },

  //NOT CURRENTLY SUPPORTED BY API
  getAllShared: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/broadcast",
      false,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.2
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? true : false,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.3
  _getArticles: function(id, exclude, continuation, success, failure) {
    var parameters = {output: "json", count: 40}

    if(!id.endsWith("/tag/global.saved") && Preferences.isOldestFirst()) {
      parameters.ranked = "oldest"
    }

    if(continuation) {
      parameters.continuation = continuation
    }

    if(exclude) {
      parameters.unreadOnly = exclude
    }

    new Ajax.Request(FeedlyApi.BASE_URL + "streams/" + encodeURIComponent(id) + "/contents", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onFailure: failure,
      onSuccess: function(response) {
        var articles = JSON2.parse(response.responseText)
        
        //Do post-processing to conform articles to FeedSpider spec
		articles.items.each(function(article) {
			//Set article categories
			article.categories = []
			if(article.tags){
				article.tags.each(function(tag) {
					if (tag.id !== undefined)
					{
						if(tag.id.endsWith("/tag/global.read")) {
							article.categories.push("/state/com.google/read")
						}
						
						if(tag.id.endsWith("/tag/global.saved")) {
							article.categories.push("/state/com.google/starred")
						}
					}
    			})
			}
			if (article.unread !== undefined)
			{
				if(article.unread == false)
				{
					article.categories.push("/state/com.google/read")
				}
			}

			//Set article timestamp
			article.crawlTimeMsec = article.crawled
		})
        
        success(articles.items, articles.id, articles.continuation)
      }
    })
  },

  //UPDATED 0.9.5
  markAllRead: function(id, success, failure) {
    if (id === "user/-/state/com.google/reading-list")
    {
    	id = "user/" + this.credentials.id + "/category/global.all"
    }
    
    if (id.indexOf("category") !== -1)
    {
    	var parameters = {
			action: "markAsRead",
			type: "categories",
			categoryIds: [id],
			asOf: new Date().getTime()
		}
    }
    else
    {
		var parameters = {
			action: "markAsRead",
			type: "feeds",
			feedIds: [id],
			asOf: new Date().getTime()
		}
    }
	
	this._editMarker(parameters, success, failure)
  },

  //TODO NEXT VERSION
  search: function(query, id, success, failure) {
    var parameters = {
      q: query,
      num: 50,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

    new Ajax.Request(FeedlyApi.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: failure
    })
  },

  //TODO NEXT VERSION
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

          new Ajax.Request(FeedlyApi.BASE_URL + "stream/items/contents", {
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

  //TODO NEXT VERSION
  mapSearchResults: function(response) {
    console.log(response.responseText)
  },

  //UPDATED 0.9.5
  setArticleRead: function(articleId, subscriptionId, success, failure) {
	var parameters = {
    	action: "markAsRead",
        type: "entries",
        entryIds: [articleId]
    }
	
	this._editMarker(parameters, success, failure)
  },
  
  //UPDATED 0.9.5
  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
	var parameters = {
    	action: "keepUnread",
        type: "entries",
        entryIds: [articleId]
    }
	
	this._editMarker(parameters, success, failure)
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

  //UPDATED 0.9.5
  setArticleStarred: function(articleId, subscriptionId, success, failure) {
	var parameters = {
        entryIds: [articleId]
    }
	this._addTag(parameters, "user/" + this.credentials.id +"/tag/global.saved", success, failure)
  },

  //UPDATED 0.9.5
  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
	this._removeTag(articleId, "user/" + this.credentials.id +"/tag/global.saved", success, failure)
  },
  
  //UPDATED 0.9.5
  _editMarker: function(parameters, success, failure) {
  	 new Ajax.Request(FeedlyApi.BASE_URL + "markers", {
    	method: "post",
        postBody: JSON.stringify(parameters),
        requestHeaders: this._requestHeaders(),
        contentType: "application/json",
        onSuccess: success,
        onFailure: failure
    })
  },
    
  //UPDATED 0.9.5
  _addTag: function(parameters, tag, success, failure) {
    Log.debug("adding tag "+ tag)
    this._ajaxPut(parameters, FeedlyApi.BASE_URL + "tags/" + encodeURIComponent(tag), success, failure)
  },
  
  //UPDATED 0.9.5
  _removeTag: function(articleId, tag, success, failure) {
    Log.debug("removing tag "+ tag)
	this._ajaxDelete(FeedlyApi.BASE_URL + "tags/" + encodeURIComponent(tag) + "/" + encodeURIComponent(articleId), success, failure)
  },

  //UPDATED 0.9.5
  _requestHeaders: function() {
    if (this._checkTokenExpiry())
    {
    	return {Authorization:"OAuth " + this.credentials.accessToken}
    }
    else
    {
    	return {Authorization:"OAuth Error"}
    }
  },
  
  //UPDATED 1.1.2
  _ajaxPut: function(params, url, success, failure) {
	if (this._checkTokenExpiry)
	{
		try {
			var req = new XMLHttpRequest()
			req.open("PUT", url, true)
			req.setRequestHeader('Content-Type', 'application/json')
			req.setRequestHeader('Authorization', "OAuth " + this.credentials.accessToken)
			req.send(JSON.stringify(params))
			req.onreadystatechange = function() {
				if(req.readyState === 4 && req.status === 200){
					success()
				} 
				else if(req.readyState === 4 && req.status !== 200){
					failure()
				}
				else
				{
					return
				}
			}
		}
		catch (e) {
			Log.debug('_ajaxPut failed! Error:' + e)
			failure()
		}
    }
    else
    {
    	failure
    }
  },
  
  //UPDATED 1.1.2
  _ajaxDelete: function(url, success, failure) {
	if (this._checkTokenExpiry)
	{
		try {
			var req = new XMLHttpRequest()
			req.open("DELETE", url, true)
			req.setRequestHeader('Authorization', "OAuth " + this.credentials.accessToken)
			req.send()
			req.onreadystatechange = function() {
				if(req.readyState === 4 && req.status === 200){
					success()
				} 
				else if(req.readyState === 4 && req.status !== 200){
					failure()
				}
				else
				{
					return
				}
			}
		}
		catch (e) {
			Log.debug('_ajaxDelete failed! Error:' + e)
			failure()
		}
    }
    else
    {
    	failure
    }
  },
  
  //UPDATED 1.0.3
  _checkTokenExpiry: function() {
    if (new Date(this.credentials.tokenExpiry).getTime() > new Date().getTime())
    {
    	return true
    } 
    else
    {
    	var parameters = {
    		refresh_token: this.credentials.refreshToken,
        	client_id: FeedlyApi.CLIENT_ID,
        	client_secret: FeedlyApi.CLIENT_SECRET,
        	grant_type: "refresh_token"
    	}
    	
    	try {
        	var req = new XMLHttpRequest()
        	req.open("POST", FeedlyApi.BASE_URL + "auth/token", false)
        	req.setRequestHeader('Content-Type', 'application/json')
        	req.send(JSON.stringify(parameters))
			if(req.readyState === 4 && req.status === 200){
				response = req.responseText.evalJSON()
				if (response) {
					if (response.id) {
						this.credentials.id = response.id
					}
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
					if (response.plan) {
						this.credentials.plan = response.plan
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
  
  //UPDATED 0.9.5
  supportsAllArticles: function() {
	return true
  },
  
  //UPDATED 0.9.5
  supportsStarred: function() {
	return true
  },
  
  //UPDATED 0.9.5
  supportsShared: function() {
	return false
  },
  
  //UPDATED 0.9.5
  supportsSearch: function() {
	return false
  },
  
  //UPDATED 0.9.5
  supportsManualSort: function() {
	return false
  }
})

FeedlyApi.BASE_URL = "https://cloud.feedly.com/v3/";
FeedlyApi.CLIENT_ID = "feedspider";
FeedlyApi.CLIENT_SECRET = "FE01DA2G93CK87ZP8NW6T5WYG862";