var TTRSSApi = Class.create({
  //UPDATED 1.1.0
  login: function(credentials, success, failure) {
	//Clean Up Base URL (if necessary)
	//Remove whitespace
	credentials.server = credentials.server.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
	
	//Remove trailing slash
	credentials.server = credentials.server.replace(/\/$/, "");
	
  	TTRSSApi.BASE_URL = credentials.server + "/api/"
  	
    var authSuccess = function(response) {
      var authResult = response.responseText.evalJSON()
      if(authResult.content.error)
      {
      	Log.debug("Login Failure. Error: " + authResult.content.error)
      	failure()
      }
      else if (!authResult.content.api_level || authResult.content.api_level < 7)
      {
        Log.debug("Login Failure. API Level too low")
      	failure()
      }
      else if(authResult.content.session_id)
      {
      	this.auth = authResult.content.session_id
      	success(this.auth)
      }
      else
      {
      	failure()
      }
    }.bind(this)
    
    var params = {
    	op: "login",
		user: credentials.email,
		password: credentials.password
    }
    
    new Ajax.Request(TTRSSApi.BASE_URL, {
      method: "post",
      postBody: JSON.stringify(params),
      onSuccess: authSuccess,
      onFailure: failure
    })
  },
  
  //UPDATED 1.1.2
  getTags: function(success, failure) {
    var params = {
		sid: this.auth,
		op: "getCategories",
		include_empty: false
	}
    
	new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(params),
		onSuccess: function(response){
			//Post-Processing
			var tags = response.responseText.evalJSON()
			tags.content.each(function(tag) {
				tag.sortid = tag.order_id
			})
			
			success(tags.content)
		},
		onFailure: failure,
	})
  },

  //NOT SUPPORTED BY API
  getSortOrder: function(success, failure) {
    new Ajax.Request(TTRSSApi.BASE_URL + "preference/stream/list", {
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

  //NOT SUPPORTED BY API
  setSortOrder: function(sortOrder, stream) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(TTRSSApi.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },
  
  //UPDATED 1.1.0
  unsubscribe: function(feed) {
    if(feed.constructor == Folder) {
      Feeder.notify($L("Folder Delete Not Supported"))
      Mojo.Event.send(document, "FolderDeleted", {id: feed.id})
      //this.removeLabel(feed)
    }
    else {
		var parameters = {
		  sid: this.auth,
		  op: "unsubscribeFeed",
		  feed_id: feed.id
		}

        new Ajax.Request(TTRSSApi.BASE_URL, {
          method: "post",
          postBody: JSON.stringify(parameters),
          onSuccess: function() {Mojo.Event.send(document, "SubscriptionDeleted", {id: feed.id, count: feed.unreadCount})}
        })
    }
  },

  //NOT SUPPORTED BY API
  removeLabel: function(folder) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: folder.id,
        t: folder.title
      }

      new Ajax.Request(TTRSSApi.BASE_URL + "disable-tag", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onSuccess: function() {Mojo.Event.send(document, "FolderDeleted", {id: folder.id})}
      })
    }.bind(this))
  },
  
  //NOT SUPPORTED BY API
  searchSubscriptions: function(query, success, failure) {
    failure()
    /*var self = this

    new Ajax.Request(TTRSSApi.BASE_URL + "feed-finder", {
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

  //UPDATED 1.1.0
  addSubscription: function(url, success, failure) {
    var parameters = {
	  sid: this.auth,
	  op: "subscribeToFeed",
	  feed_url: url,
	  category_id: 0
	}
	
    new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(parameters),
		onSuccess: function(response) {
          var json = response.responseText.evalJSON()
		  
          if(json.content.status.code == 1) {
            success()
          }
          else {
            failure()
          }
        },
		onFailure: failure,
	}) 
  },

  //UPDATED 1.1.0
  getAllSubscriptions: function(success, failure) {
    var self = this
	
	var params = {
		sid: this.auth,
		op: "getCategories",
		include_empty: false
	}
	
	new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(params),
		onSuccess: this._processCategories.bind(this, success, failure),
		onFailure: failure
	})
  },
  
  //UPDATED 1.1.0
  _processCategories: function(success, failure, response) {
			var self = this
			var categories = response.responseText.evalJSON().content
			var subscriptions = []
			var params = {
				sid: this.auth,
				op: "getFeeds"
			}
			
			categories.each(function(category) {				
				if (category.id > 0)
				{
					params.cat_id = category.id
					
					new Ajax.Request(TTRSSApi.BASE_URL, {
						method: "post",
						asynchronous: false,
						postBody: JSON.stringify(params),
						onSuccess: function(response){
							var feeds = response.responseText.evalJSON().content
							feeds.each(function(feed) {
								feed.categories = [{
									id: category.id,
									label: category.title
								}]
								subscriptions.push(feed)
							})
						},
						onFailure: failure
					})
				}
			})
			
			params.cat_id = 0

			new Ajax.Request(TTRSSApi.BASE_URL, {
				method: "post",
				postBody: JSON.stringify(params),
				onSuccess: function(response){
					var feeds = response.responseText.evalJSON().content
					feeds.each(function(feed) {
						subscriptions.push(feed)
					})
					self.cacheTitles(subscriptions)
					success(subscriptions)  
				},
				onFailure: failure
			})
  },
  
  //UPDATED 1.1.0
  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },

  //UPDATED 1.1.0
  titleFor: function(id) {
    return this.titles[id]
  },

  //UPDATED 1.1.2
  getUnreadCounts: function(success, failure) {
    var params = {
    	sid: this.auth,
    	op: "getCounters",
    	output_mode: "f"
    }
    
    new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(params),
		onSuccess: function(response){
			var json = response.responseText.evalJSON()
			var feeds = []
			
			json.content.each(function(feed) {
				if (feed.id > 0 && feed.kind !== "cat")
				{
					feed.count = feed.counter
					feeds.push(feed)
				}
			})
						
			success(feeds)
		},
		onFailure: failure
	})
  },

  //UPDATED 1.1.0
  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      -4,
      Preferences.hideReadArticles() ? "unread" : "all_articles",
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      -1,
      "all_articles",
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  getAllShared: function(continuation, success, failure) {
    this._getArticles(
      -2,
      "all_articles",
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? "unread" : "all_articles",
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.1.3
  _getArticles: function(id, exclude, continuation, success, failure) {
    var parameters = {
    	sid: this.auth,
    	op: "getHeadlines",
    	feed_id: id,
    	limit: 40,
    	show_content: true,
    }
    
    if(id != -4 &&
       id != -2 &&
       Preferences.isOldestFirst()) {
      parameters.order_by = "date_reverse"
    } else {
      parameters.order_by = "feed_dates"
    }

    if(continuation) {
      parameters.skip = continuation
    }

    if(exclude) {
      parameters.view_mode = exclude
    }
    
    if (id.constructor == String)
    {
    	parameters.is_cat = true
    }    
    
    new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(parameters),
		onSuccess: function(response){
			var articles = JSON2.parse(response.responseText)

			//Do post-processing to conform articles to FeedSpider spec
			articles.content.each(function(article) {
				//Set article origin
				article.origin = {streamId : article.feed_id}
				
				//Set article content				
				article.content = {content: article.content}
				
				//Set article categories
				article.categories = []
				if (!article.unread)
				{
					article.categories.push("/state/com.google/read")
				}
				
				if (article.marked)
				{
					article.categories.push("/state/com.google/starred")
				}
				
				if (article.published)
				{
					article.categories.push("/state/com.google/broadcast")
				}
				
				//Set article link
				article.alternate = [{
					type: "html",
					href: article.link
				}]
				
				//Set article timestamp
				article.crawlTimeMsec = article.updated + "000"
			})
			
			//Load more articles (if there are more to load)
			if(articles.content.length == parameters.limit)
			{
				if(continuation)
				{
					continuation = continuation + parameters.limit
				}
				else
				{
					continuation = parameters.limit
				}
				success(articles.content, id, continuation)
			}
			else
			{
				success(articles.content, id, false)
			}
		},
		onFailure: failure,
	})    
  },

  //UPDATED 1.1.0
  markAllRead: function(id, success, failure) {
    var parameters = {
    	sid: this.auth,
    	op: "catchupFeed",
    	feed_id: id
    }
    
    //NOTE: This particular behaviour works due to how category ids are handled, as opposed to feed ids within the app
    //it's a bit of an ugly hack, but there isn't an easy way of determining feed vs category without making significant
    //changes elsewhere.
    if (id === "user/-/state/com.google/reading-list")
    {
    	//NOTE: This behaviour does not work correctly with 1.12 - it must be a bug on the other end.
    	parameters.feed_id = -4
    	parameters.is_cat = false
    }
    else if (id.constructor == String)
    {
    	parameters.is_cat = true
    }
    else if (id.constructor == Number)
    {
    	parameters.is_cat = false
    }
	
	new Ajax.Request(TTRSSApi.BASE_URL, {
	  method: "post",
	  postBody: JSON.stringify(parameters),
	  onSuccess: success,
	  onFailure: failure
	})
  },

  //NOT SUPPORTED BY API
  search: function(query, id, success, failure) {
    var parameters = {
      q: query,
      num: 50,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

    new Ajax.Request(TTRSSApi.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: failure
    })
  },

  //NOT SUPPORTED BY API
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

          new Ajax.Request(TTRSSApi.BASE_URL + "stream/items/contents", {
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

  //NOT SUPPORTED BY API
  mapSearchResults: function(response) {
    console.log(response.responseText)
  },

  //UPDATED 1.1.0
  setArticleRead: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      2,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
    this._editTag(
      articleId,
      subscriptionId,
      2,
      null,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  setArticleShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      1,
      null,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      1,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  setArticleStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      0,
      null,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      0,
      success,
      failure
    )
  },

  //UPDATED 1.1.0
  _editTag: function(articleId, subscriptionId, addTag, removeTag, success, failure) {
    Log.debug("editing tag for article id = " + articleId + " and subscription id = " + subscriptionId)

	var parameters = {
	  sid: this.auth,
	  op: "updateArticle",
	  article_ids: articleId
	}

	if(addTag !== null){
		parameters.mode = 1
		parameters.field = addTag
	}
	
	if(removeTag !== null){
		parameters.mode = 0
		parameters.field = removeTag
	}
	
    new Ajax.Request(TTRSSApi.BASE_URL, {
		method: "post",
		postBody: JSON.stringify(parameters),
		onSuccess: success,
		onFailure: failure,
	}) 
  },

  //UPDATED 1.1.0    
  supportsAllArticles: function() {
	return true
  },

  //UPDATED 1.1.0  
  supportsStarred: function() {
	return true
  },

  //UPDATED 1.1.0  
  supportsShared: function() {
	return true
  },

  //UPDATED 1.1.0  
  supportsSearch: function() {
	return false
  },
  
  //UPDATED 1.1.0
  supportsManualSort: function() {
	return false
  }
})

TTRSSApi.BASE_URL = ""