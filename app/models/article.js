var Article = Class.create({
  initialize: function(data, subscription) {
    this.api = subscription.api
    this.id = data.id
    this.subscriptionId = subscription.id || (data.origin ? data.origin.streamId : "")
    this.title = data.title
    this.author = data.author
    this.origin = data.origin ? data.origin.title : null
    var content = data.content || data.summary
    this.summary = this.cleanUp(content.content)
    this.setStates(data.categories)
    this.setDates(parseInt(data.crawlTimeMsec))
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
  
  leftPad: function(number) {
    var s = "0000" + number
    return s.substr(s.length - 2)
  },
  
  turnReadOn: function(done) {
    this.api.setArticleRead(this.id, this.subscriptionId, function() {
      this.isRead = true
      done()
    }.bind(this))
  },
  
  turnReadOff: function(done) {
    this.api.setArticleUnread(this.id, this.subscriptionId, function() {
      this.isRead = false
      done()
    }.bind(this))
  },
  
  turnShareOn: function(done) {
    done()
  },
  
  turnShareOff: function(done) {
    done()
  },
  
  turnStarOn: function(done) {
    done()
  },
  
  turnStarOff: function(done) {
    done()
  }
})