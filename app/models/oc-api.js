var OCApi = Class.create({
  //UPDATED 1.2.1
  login: function(credentials, success, failure) {
	//Clean Up Base URL (if necessary)
	//Remove whitespace
	credentials.server = credentials.server.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
	
	//Remove trailing slash
	credentials.server = credentials.server.replace(/\/$/, "");
	
  	OCApi.BASE_URL = credentials.server + "/index.php/apps/news/api/v1-2/"
    this.auth = btoa(credentials.email + ":" + credentials.password)
    
    new Ajax.Request(OCApi.BASE_URL + "version", {
      method: "get",
 	  requestHeaders: this._requestHeaders(),
      onSuccess: success(this.auth),
      onFailure: failure
    })
  },
  
  //UPDATED 1.2.1
  getTags: function(success, failure) {
	new Ajax.Request(OCApi.BASE_URL + "folders", {
		method: "get",
        requestHeaders: this._requestHeaders(),	
		onSuccess: function(response){
			//Post-Processing
			var tags = response.responseText.evalJSON().folders
			var i = 1
			tags.each(function(tag) {
				tag.sortid = i
				i++			
			})
			
			success(tags)
		},
		onFailure: failure,
	})
  },

  //NOT SUPPORTED BY API
  getSortOrder: function(success, failure) {
    /*new Ajax.Request(OCApi.BASE_URL + "preference/stream/list", {
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
    failure()
  },

  //NOT SUPPORTED BY API
  setSortOrder: function(sortOrder, stream) {
    /*this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(OCApi.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))*/
  },
  
  //UPDATED 1.2.1
  unsubscribe: function(feed) {
    if(feed.constructor == Folder) {
      Mojo.Event.send(document, "FolderDeleted", {id: feed.id})
      this.removeLabel(feed)
    }
    else {
    	this._ajaxDelete(OCApi.BASE_URL + "feeds/" + feed.id,function() {Mojo.Event.send(document, "SubscriptionDeleted", {id: feed.id, count: feed.unreadCount})},function() {})
    }
  },

  //UPDATED 1.2.1
  removeLabel: function(folder) {
    this._ajaxDelete(OCApi.BASE_URL + "folders/" + folder.id.substr(7),function() {Mojo.Event.send(document, "FolderDeleted", {id: folder.id})},function() {})
  },
  
  //NOT SUPPORTED BY API
  searchSubscriptions: function(query, success, failure) {
    failure()
    /*var self = this

    new Ajax.Request(OCApi.BASE_URL + "feed-finder", {
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

  //UPDATED 1.2.1
  addSubscription: function(url, success, failure) {
    var parameters = {
	  url: url,
	  folderId: 0
	}
	
    new Ajax.Request(OCApi.BASE_URL + "feeds", {
		method: "post",
        requestHeaders: this._requestHeaders(),	
		postBody: JSON.stringify(parameters),
		onSuccess: success,
		onFailure: failure
	}) 
  },

  //UPDATED 1.2.1
  getAllSubscriptions: function(success, failure) {
	var self = this
	    
	new Ajax.Request(OCApi.BASE_URL + "feeds", {
		method: "get",
        requestHeaders: this._requestHeaders(),		
		onSuccess: this._processFeeds.bind(this, success, failure),
		onFailure: failure
	})
  },
  
  //UPDATED 1.2.1
  _processFeeds: function(success, failure, response) {
	var self = this
	var feeds = response.responseText.evalJSON().feeds
	var subscriptions = []

	new Ajax.Request(OCApi.BASE_URL + "folders", {
		method: "get",
		asynchronous: false,
		requestHeaders: this._requestHeaders(),	
		onSuccess: function(response){
			var tags = response.responseText.evalJSON().folders
			self._cacheFolderTitles(tags)
		},
		onFailure: failure
	})

	feeds.each(function(feed) {
		if (feed.folderId > 0)
		{
			feed.categories = [{
				id: "folder/" + feed.folderId,
				label: self._titleForFolder(feed.folderId)
			}]
		}
		subscriptions.push(feed)
	})
	self.cacheTitles(subscriptions)
	success(subscriptions)
  },
  
  //UPDATED 1.2.1
  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },
  
  //UPDATED 1.2.1
  _cacheFolderTitles: function(folders) {
    var self = this
    self.folderTitles = {}

    folders.each(function(folder) {
      self.folderTitles[folder.id] = folder.name
    })
  },
  
  //UPDATED 1.2.1
  _cacheArticleHashes: function(articles, append) {
    var self = this
    
    if (append == false)
    {
    	self.articleHashes = {}
    }

    articles.each(function(article) {
      self.articleHashes[article.id] = article.guidHash
    })
  },

  //UPDATED 1.2.1
  titleFor: function(id) {
    return this.titles[id]
  },
  
  //UPDATED 1.2.1
  _titleForFolder: function(id) {
    return this.folderTitles[id]
  },
  
  //UPDATED 1.2.1
  _hashForArticle: function(id) {
    return this.articleHashes[id]
  },

  //UPDATED 1.2.1
  getUnreadCounts: function(success, failure) { 
    new Ajax.Request(OCApi.BASE_URL + "feeds", {
		method: "get",
        requestHeaders: this._requestHeaders(),
		onSuccess: function(response){
			var json = response.responseText.evalJSON()
			var feeds = []
			
			json.feeds.each(function(feed) {
				var feedCount = {}
				feedCount.id = feed.id
				feedCount.count = feed.unreadCount
				feeds.push(feedCount)
			})	
			success(feeds)
		},
		onFailure: failure
	})
  },

  //UPDATED 1.2.1
  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "all",
      Preferences.hideReadArticles() ? false : true,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.2.1
  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "starred",
      true,
      continuation,
      success,
      failure
    )
  },

  //NOT SUPPORTED BY API
  getAllShared: function(continuation, success, failure) {
    failure()
  },

  //NOT SUPPORTED BY API
  getAllFresh: function(continuation, success, failure) {
	failure()
  },

  //NOT SUPPORTED BY API
  getAllArchived: function(continuation, success, failure) {
	failure()
  },

  //UPDATED 1.2.1
  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? false : true,
      continuation,
      success,
      failure
    )
  },

  //UPDATED 1.2.1
  _getArticles: function(id, exclude, continuation, success, failure) {
    var self = this
    
    var parameters = {
    	batchSize: 40,
    	getRead: exclude
    }
    
    if (id.toString().substr(0,7) === "folder/")
    {
    	parameters.type = 1
    	parameters.id = id.substr(7)
    }
	else if (id === "starred")
    {
    	parameters.type = 2
    	parameters.id = 0
    }
    else if (id === "all")
    {
    	parameters.type = 3
    	parameters.id = 0
    }
    else
    {
    	parameters.type = 0
    	parameters.id = id
    }
    
    if(continuation) {
      parameters.offset = continuation
    }    
    
    new Ajax.Request(OCApi.BASE_URL + "items", {
		method: "get",
		parameters: parameters,
		requestHeaders: this._requestHeaders(),
		onSuccess: function(response){
			var articles = JSON2.parse(response.responseText)
			var lastArticleId = 0
			OCApi.NEWESTITEMID = 0
			
			if(!continuation && articles.items[0] != undefined)
			{
				OCApi.NEWESTITEMID = articles.items[0].id
			}
			
			//Do post-processing to conform articles to FeedSpider spec
			articles.items.each(function(article) {
				//Set article origin
				article.origin = {streamId : article.feedId}
				
				//Set article content				
				article.content = {content: article.body}
				
				//Set article categories
				article.categories = []
				if (!article.unread)
				{
					article.categories.push("/state/com.google/read")
				}
				
				if (article.starred)
				{
					article.categories.push("/state/com.google/starred")
				}
				
				//Set article link
				article.alternate = [{
					type: "html",
					href: article.url
				}]
				
				//Set article timestamp
				article.crawlTimeMsec = article.pubDate	+ "000"
				
				//Check article id
				if (article.id < lastArticleId || lastArticleId == 0)
				{
					lastArticleId = article.id
				}
			})
			
			//Store article hashes
			if(continuation)
			{
				self._cacheArticleHashes(articles.items, true)
			}
			else
			{
				self._cacheArticleHashes(articles.items, false)
			}
			
			//Load more articles (if there are more to load)
			if(articles.items.length == parameters.batchSize)
			{
				success(articles.items, id, lastArticleId)
			}
			else
			{
				success(articles.items, id, false)
			}
		},
		onFailure: failure,
	})    
  },

  //UPDATED 1.2.1
  markAllRead: function(id, success, failure) { 
    var parameters = {
    	newestItemId: OCApi.NEWESTITEMID
    }
    
    if (id === "user/-/state/com.google/reading-list")
    {
    	this._ajaxPut(parameters, OCApi.BASE_URL + "items/read", success, failure)
    }
    else if (id.toString().substr(0,7) === "folder/")
    {
		this._ajaxPut(parameters, OCApi.BASE_URL + "folders/" + id.substr(7) + "/read", success, failure)
    }
    else
    {
		this._ajaxPut(parameters, OCApi.BASE_URL + "feeds/" + id + "/read", success, failure)
    }
  },

  //NOT SUPPORTED BY API
  search: function(query, id, success, failure) {
    /*var parameters = {
      q: query,
      num: 50,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

    new Ajax.Request(OCApi.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: failure
    })*/
    failure()
  },

  //NOT SUPPORTED BY API
  searchItemsFound: function(success, failure, response) {
    /*var self = this
    var ids = response.responseText.evalJSON().results

    if(ids.length) {
      self._getEditToken(
        function(token) {
          var parameters = {
            T: token,
            i: ids.map(function(n) {return n.id})
          }

          new Ajax.Request(OCApi.BASE_URL + "stream/items/contents", {
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
    failure()
  },

  //NOT SUPPORTED BY API
  mapSearchResults: function(response) {
    //console.log(response.responseText)
  },

  //UPDATED 1.2.1
  setArticleRead: function(articleId, subscriptionId, success, failure) {
    this._ajaxPut({}, OCApi.BASE_URL + "items/" + articleId + "/read", success, failure)
  },

  //UPDATED 1.2.1
  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
	this._ajaxPut({}, OCApi.BASE_URL + "items/" + articleId + "/unread", success, failure)
  },

  //NOT SUPPORTED BY API
  setArticleShared: function(articleId, subscriptionId, success, failure) {
    /*this._editTag(
      articleId,
      subscriptionId,
      1,
      null,
      success,
      failure
    )*/
    failure()
  },

  //NOT SUPPORTED BY API
  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
    /*this._editTag(
      articleId,
      subscriptionId,
      null,
      1,
      success,
      failure
    )*/
    failure()
  },

  //UPDATED 1.2.1
  setArticleStarred: function(articleId, subscriptionId, success, failure) {
    var articleGuid = this._hashForArticle(articleId)
    this._ajaxPut({}, OCApi.BASE_URL + "items/" + subscriptionId + "/" + articleGuid + "/star", success, failure)
  },

  //UPDATED 1.2.1
  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
    var articleGuid = this._hashForArticle(articleId)    
    this._ajaxPut({}, OCApi.BASE_URL + "items/" + subscriptionId + "/" + articleGuid + "/unstar", success, failure)
  },
  
  //UPDATED 1.2.1
  _requestHeaders: function() {
    return {Authorization:"Basic " + this.auth}
  },

  //UPDATED 1.2.1
  _ajaxPut: function(params, url, success, failure) {
	try {
		var req = new XMLHttpRequest()
		req.open("PUT", url, true)
		req.setRequestHeader('Content-Type', 'application/json')
		req.setRequestHeader('Authorization', "Basic " + this.auth)
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
  },
  
  //UPDATED 1.2.1
  _ajaxDelete: function(url, success, failure) {
	try {
		var req = new XMLHttpRequest()
		req.open("DELETE", url, true)
		req.setRequestHeader('Authorization', "Basic " + this.auth)
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
  },

  //UPDATED 1.2.1    
  supportsAllArticles: function() {
	return true
  },

  //UPDATED 1.2.1  
  supportsArchived: function() {
	return false
  },
  
  //UPDATED 1.2.1  
  supportsFresh: function() {
	return false
  },

  //UPDATED 1.2.1  
  supportsStarred: function() {
	return true
  },

  //UPDATED 1.2.1  
  supportsShared: function() {
	return false
  },

  //UPDATED 1.2.1  
  supportsSearch: function() {
	return false
  },
  
  //UPDATED 1.2.1
  supportsManualSort: function() {
	return false
  }
})

OCApi.BASE_URL = ""
OCApi.NEWESTITEMID = 0