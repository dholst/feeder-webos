var ArticleAssistant = Class.create(BaseAssistant, {
  initialize: function($super, article) {
    $super()
    this.article = article
  },

  setup: function($super) {
    $super()
    this.controller.listen("previous-article", Mojo.Event.tap, this.previousArticle = this.previousArticle.bind(this))
    this.controller.listen("next-article", Mojo.Event.tap, this.nextArticle = this.nextArticle.bind(this))
    this.controller.listen("starred", Mojo.Event.tap, this.setStarred = this.setStarred.bind(this))
    // this.controller.listen("shared", Mojo.Event.tap, this.setShared = this.setShared.bind(this))
    this.controller.listen("read", Mojo.Event.tap, this.setRead = this.setRead.bind(this))
    this.controller.listen("sendto", Mojo.Event.tap, this.sendTo = this.sendTo.bind(this))
    this.controller.listen("header", Mojo.Event.tap, this.openInBrowser = this.openInBrowser.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("previous-article", Mojo.Event.tap, this.previousArticle)
    this.controller.stopListening("next-article", Mojo.Event.tap, this.nextArticle)
    this.controller.stopListening("starred", Mojo.Event.tap, this.setStarred)
    // this.controller.stopListening("shared", Mojo.Event.tap, this.setShared)
    this.controller.stopListening("read", Mojo.Event.tap, this.setRead)
    this.controller.stopListening("sendto", Mojo.Event.tap, this.sendTo)
    this.controller.stopListening("header", Mojo.Event.tap, this.openInBrowser)
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

    if(!this.article.isRead) {
      this.toggleState(this.controller.get("read"), "Read")
    }
  },

  setStarred: function(event) {
    this.toggleState(event.target, "Star")
  },

  setShared: function(event) {
    this.toggleState(event.target, "Share")
  },

  setRead: function(event) {
    this.toggleState(event.target, "Read")
  },

  toggleState: function(target, state) {
    if(!target.hasClassName("working")) {
      target.addClassName("working")
      target.toggleClassName("on")

      this.article["turn" + state + (target.hasClassName("on") ? "On" : "Off")](function() {
        target.removeClassName("working")
      })
    }
  },

  sendTo: function(event) {

  },

  openInBrowser: function() {
    if(this.article.url) {
      this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "open",
        parameters: {
          id: "com.palm.app.browser",
          params: {
            target: this.article.url
          }
        }
      })
    }
  },

  previousArticle: function() {
    this.article.getPrevious(function(article) {
      if(article) {
        this.controller.stageController.swapScene("article", article)
      }
      else {
        this.controller.stageController.popScene()
      }
    }.bind(this))
  },

  nextArticle: function() {
    this.article.getNext(function(article) {
      if(article) {
        this.controller.stageController.swapScene("article", article)
      }
      else {
        this.controller.stageController.popScene()
      }
    }.bind(this))
  }
})