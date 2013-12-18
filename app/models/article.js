var Article = Class.create({
  initialize: function(data, subscription) {
    this.api = subscription.api
    this.id = data.id
    this.subscription = subscription
    this.subscriptionId = data.origin ? data.origin.streamId : subscription.id
    this.title = data.title || "No Title"
    this.author = data.author
    this.origin = this.api.titleFor(this.subscriptionId)
    var content = data.content || data.summary || {content: ""}
    this.summary = this.cleanUp(content.content)
    this.readLocked = data.isReadStateLocked
    this.isRead = false
    this.isShared = false
    this.isStarred = false
    
    if(data.tags)
    {
		this.setStates(data.tags)
		
		if (data.unread !== undefined)
		{
			this.isRead = !data.unread
		}
    }
    else if (data.unread !== undefined)
    {
    	this.isRead = !data.unread
    }
    else
    {
    	this.setStates(data.categories)
    }
    var pubDate = data.crawlTimeMsec || data.crawled
    this.setDates(parseInt(pubDate, 10))
    this.setArticleLink(data.alternate)
  },

  cleanUp: function(content) {
    var cleaned = this.replaceYouTubeLinks(content)
    cleaned = cleaned.replace(/<script.*?<\/script.*?>/g , "")
    cleaned = cleaned.replace(/<iframe.*?<\/iframe.*?>/g , "")
    cleaned = cleaned.replace(/<object.*?<\/object.*?>/g , "")
    return cleaned
  },

  replaceYouTubeLinks: function(content) {
    var embed = /<(embed|iframe).*src="(.*?youtube.com.*?)".*<\/(embed|iframe)>/
    var urlMatch = embed.exec(content)

    if(urlMatch) {
      var idMatch = /\/(embed|v)\/([_\-a-zA-Z0-9]+)/.exec(urlMatch[2])

      if(idMatch) {
        var id = idMatch[2]
        content = content.replace(embed, '<div class="youtube"><img class="youtube-thumbnail" src="http://img.youtube.com/vi/' + id + '/0.jpg"><div class="youtube-play" data-url="http://youtube.com/watch?v=' + id + '">&nbsp;</div></div>')
      }
    }

    return content
  },

  setStates: function(categories) {
    categories.each(function(category) {
    	if (category.id !== undefined)
    	{
			if(category.id.endsWith("/tag/global.read")) {
        		this.isRead = true
      		}

      		if(category.id.endsWith("/tag/global.saved")) {
        		this.isStarred = true
      		}
    	}
    	else
    	{
			if(category.endsWith("/state/com.google/read")) {
        		this.isRead = true
      		}

      		if(category.endsWith("/state/com.google/kept-unread")) {
        		this.keepUnread = true
      		}

      		if(category.endsWith("/state/com.google/starred")) {
        		this.isStarred = true
      		}

      		if(category.endsWith("/state/com.google/broadcast")) {
        		this.isShared = true
      		}    		
    	}
    }.bind(this))
  },

  setDates: function(milliseconds) {
    this.updatedAt = new Date(milliseconds)
    var month = this.leftPad(this.updatedAt.getMonth() + 1)
    var day = this.leftPad(this.updatedAt.getDate())
    var year = "" + this.updatedAt.getFullYear()

    this.displayDate = Mojo.Format.formatDate(this.updatedAt, {date: "medium"})
    this.sortDate = year + month + day
  },

  setArticleLink: function(alternates) {
    (alternates || []).each(function(alternate) {
      if(alternate.type.include("html")) {
        this.url = alternate.href
        return
      }
    }.bind(this))
  },

  leftPad: function(number) {
    var s = "0000" + number
    return s.substr(s.length - 2)
  },

  toggleRead: function() {
    if(this.isRead) {
      this.turnReadOff(function() {}, function() {}, true)
    }
    else {
      this.turnReadOn(function() {}, function() {})
    }
  },

  toggleStarred: function() {
    if(this.isStarred) {
      this.turnStarOff(function() {}, function() {})
    }
    else {
      this.turnStarOn(function() {}, function() {})
    }
  },

  turnReadOn: function(success, failure) {
    this._setState("Read", "isRead", true, success, failure)
  },

  turnReadOff: function(success, failure, sticky) {
    this.keepUnread = sticky
    this._setState("NotRead", "isRead", false, success, failure, sticky)
  },

  turnShareOn: function(success, failure) {
    if(this.api.supportsShared())
    {
    	this._setState("Shared", "isShared", true, success, failure)
    }
    else
    {
    	Feeder.notify($L("Sharing Not Available"))
    }
  },

  turnShareOff: function(success, failure) {
    if(this.api.supportsShared())
    {
    	this._setState("NotShared", "isShared", false, success, failure)
    }
    else
    {
    	Feeder.notify($L("Sharing Not Available"))
    }
  },

  turnStarOn: function(success, failure) {
    if(this.api.supportsStarred())
    {
    	this._setState("Starred", "isStarred", true, success, failure)
    }
	else
    {
    	Feeder.notify($L("Starring Not Available"))
    }
  },

  turnStarOff: function(success, failure) {
    if(this.api.supportsStarred())
    {
    	this._setState("NotStarred", "isStarred", false, success, failure)
    }
    else
    {
    	Feeder.notify($L("Starring Not Available"))
    }
  },

  _setState: function(apiState, localProperty, localValue, success, failure, sticky) {
    Log.debug("setting article state - " + apiState)

    if(apiState.match(/Read/) && this.readLocked) {
      Feeder.notify("Read state has been locked by the service")
      success(false)
    }
    else {
      this[localProperty] = localValue

      var onComplete = function() {
        Mojo.Event.send(document, "Article" + apiState, {subscriptionId: this.subscriptionId})
        success(true)
      }.bind(this)

      this.api["setArticle" + apiState](this.id, this.subscriptionId, onComplete, failure, sticky)
    }
  },

  getPrevious: function(callback) {
    var previousIndex = this.index - 1
    var previous = null

    if(this.index) {
      previous = this.subscription.items[previousIndex]
      previous.index = previousIndex
    }

    callback(previous)
  },

  getNext: function(callback, loadingMore) {
    var nextIndex = this.index + 1
    var next = null

    if(nextIndex < this.subscription.items.length) {
      next = this.subscription.items[nextIndex]
      next.index = nextIndex
    }

    if(next && next.load_more) {
      loadingMore()

      var foundMore = function() {
        next = this.subscription.items[nextIndex]
        next.index = nextIndex
        callback(next)
      }.bind(this)

      this.subscription.findArticles(foundMore, callback)
    }
    else {
      callback(next)
    }
  }
})
