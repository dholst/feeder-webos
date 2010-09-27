var ArticleAssistant = Class.create(BaseAssistant, {
  initialize: function($super, article) {
    $super()
    this.article = article
  },
  
  ready: function($super) {
    $super()
    this.controller.get("title").update(this.article.title)
    this.controller.get("author").update(this.article.author ? "by " + this.article.author : this.article.origin)
    this.controller.get("summary").update(this.article.summary)

    if(this.article.isRead) {
      this.controller.get("read").addClassName("on")
    }
    
    if(this.article.isStarred) {
      this.controller.get("starred").addClassName("on")
    }

    if(this.article.isShared) {
      this.controller.get("shared").addClassName("on")
    }
  }
})