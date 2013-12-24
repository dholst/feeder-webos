var Api = Class.create({
  initialize: function() {
  	this.appApi = undefined
  },
  
  login: function(credentials, success, failure, controller) {
  	if (credentials.service == "tor")
  	{
  		this.appApi = new TorApi()
  		this.appApi.login(credentials, success, failure)
  	}
  	else if (credentials.service == "ino")
  	{
  		this.appApi = new InoApi()
		this.appApi.login(credentials, success, failure)
	}
	else if (credentials.service == "bq")
  	{
  		this.appApi = new BQApi()
		this.appApi.login(credentials, success, failure)
	}
	else if (credentials.service == "ttrss")
  	{
  		this.appApi = new TTRSSApi()
		this.appApi.login(credentials, success, failure)
	}
	else if (credentials.service == "feedly")
  	{
  		this.appApi = new FeedlyApi()
		this.appApi.login(credentials, success, failure, controller)
	}
	else
	{
		// No supported service to log into
		failure
	}
  },
  
  getTags: function(success, failure) {
	this.appApi.getTags(success, failure)
  },

  getSortOrder: function(success, failure) {
	this.appApi.getSortOrder(success, failure)
  },

  setSortOrder: function(sortOrder, stream) {
	this.appApi.setSortOrder(sortOrder, stream)
  },

  unsubscribe: function(feed) {
	this.appApi.unsubscribe(feed)
  },

  removeLabel: function(folder) {
	this.appApi.removeLabel(folder)
  },

  searchSubscriptions: function(query, success, failure) {
	this.appApi.searchSubscriptions(query, success, failure)
  },

  addSubscription: function(url, success, failure) {
	this.appApi.addSubscription(url, success, failure)
  },

  getAllSubscriptions: function(success, failure) {
	this.appApi.getAllSubscriptions(success, failure)
  },

  cacheTitles: function(subscriptions) {
	this.appApi.cacheTitles(subscriptions)
  },

  titleFor: function(id) {
    return this.appApi.titleFor(id)
  },

  getUnreadCounts: function(success, failure) {
	this.appApi.getUnreadCounts(success, failure)
  },

  getAllArticles: function(continuation, success, failure) {
	this.appApi.getAllArticles(continuation, success, failure)
  },

  getAllStarred: function(continuation, success, failure) {
	this.appApi.getAllStarred(continuation, success, failure)
  },

  getAllShared: function(continuation, success, failure) {
	this.appApi.getAllShared(continuation, success, failure)
  },

  getAllArticlesFor: function(id, continuation, success, failure) {
	this.appApi.getAllArticlesFor(id, continuation, success, failure)
  },

  markAllRead: function(id, success, failure) {
	this.appApi.markAllRead(id, success, failure)
  },

  search: function(query, id, success, failure) {
	this.appApi.search(query, id, success, failure)
  },

  searchItemsFound: function(success, failure, response) {
	this.appApi.searchItemsFound(success, failure, response)
  },

  mapSearchResults: function(response) {
    this.appApi.mapSearchResults(response)
  },

  setArticleRead: function(articleId, subscriptionId, success, failure) {
	this.appApi.setArticleRead(articleId, subscriptionId, success, failure)
  },

  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
	this.appApi.setArticleNotRead(articleId, subscriptionId, success, failure, sticky)
  },

  setArticleShared: function(articleId, subscriptionId, success, failure) {
	this.appApi.setArticleShared(articleId, subscriptionId, success, failure)
  },

  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
	this.appApi.setArticleNotShared(articleId, subscriptionId, success, failure)
  },

  setArticleStarred: function(articleId, subscriptionId, success, failure) {
	this.appApi.setArticleStarred(articleId, subscriptionId, success, failure)
  },

  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
	this.appApi.setArticleNotStarred(articleId, subscriptionId, success, failure)
  },
  
  supportsAllArticles: function() {
	return this.appApi.supportsAllArticles()
  },
  
  supportsStarred: function() {
	return this.appApi.supportsStarred()
  },
  
  supportsShared: function() {
	return this.appApi.supportsShared()
  },
  
  supportsSearch: function() {
	return this.appApi.supportsSearch()
  },
  
  supportsManualSort: function() {
	return this.appApi.supportsManualSort()
  }
})