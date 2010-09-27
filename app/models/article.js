var Article = Class.create({
  initialize: function(data) {
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
  }
})