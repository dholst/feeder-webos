var Article = Class.create({
  initialize: function(data, subscription) {
    this.api = subscription.api
    this.id = data.id
    this.subscription = subscription
    this.subscriptionId = data.origin ? data.origin.streamId : subscription.id
    this.title = data.title
    this.author = data.author
    this.origin = data.origin ? data.origin.title : null
    var content = data.content || data.summary
    this.summary = this.cleanUp(content.content)
    this.setStates(data.categories)
    this.setDates(parseInt(data.crawlTimeMsec))
    this.setArticleLink(data.alternate)
  },

  cleanUp: function(content) {
    var cleaned = content.replace(/<script.*?<\/script.*?>/g , "")
    cleaned = cleaned.replace(/<iframe.*?<\/iframe.*?>/g , "")
    cleaned = cleaned.replace(/<object.*?<\/object.*?>/g , "")
    return cleaned
  },

  setStates: function(categories) {
    this.isRead = false
    this.isShared = false
    this.isStarred = false

    categories.each(function(category) {
      if(category.endsWith("/state/com.google/read")) {
        this.isRead = true
      }

      if(category.endsWith("/state/com.google/starred")) {
        this.isStarred = true
      }

      if(category.endsWith("/state/com.google/broadcast")) {
        this.isShared = true
      }
    }.bind(this))
  },

  setDates: function(milliseconds) {
    this.updatedAt = new Date(milliseconds)
    var month = this.leftPad(this.updatedAt.getMonth() + 1)
    var day = this.leftPad(this.updatedAt.getDate())
    var year = "" + this.updatedAt.getFullYear()

    this.displayDate = month + "/" + day + "/" + year
    this.sortDate = year + month + day
  },

  setArticleLink: function(alternates) {
    alternates.each(function(alternate) {
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

  turnReadOn: function(done) {
    this._setState("Read", "isRead", true, done)
  },

  turnReadOff: function(done) {
    this._setState("NotRead", "isRead", false, done)
  },

  turnShareOn: function(done) {
    this._setState("Shared", "isShared", true, done)
  },

  turnShareOff: function(done) {
    this._setState("NotShared", "isShared", false, done)
  },

  turnStarOn: function(done) {
    this._setState("Starred", "isStarred", true, done)
  },

  turnStarOff: function(done) {
    this._setState("NotStarred", "isStarred", false, done)
  },

  _setState: function(apiState, localProperty, localValue, done) {
    this.api["setArticle" + apiState](this.id, this.subscriptionId, function() {
      this[localProperty] = localValue
      Mojo.Event.send(document, "Article" + apiState, {subscriptionId: this.subscriptionId})
      done()
    }.bind(this))
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