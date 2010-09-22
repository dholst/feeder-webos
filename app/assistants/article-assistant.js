var ArticleAssistant = Class.create(BaseAssistant, {
  initialize: function($super, article) {
    $super()
    this.article = article
  },
  
  ready: function($super) {
    $super()
    this.controller.get("header").update(this.article.title)
    this.controller.get("summary").update(this.article.summary)
  }
})