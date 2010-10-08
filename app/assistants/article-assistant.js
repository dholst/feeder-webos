var ArticleAssistant = Class.create(BaseAssistant, {
  initialize: function($super, article) {
    $super()
    this.article = article
    this.workingSpinner = {spinning: false}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("working-spinner", {spinnerSize: "small"}, this.workingSpinner)
    this.controller.listen("previous-article", Mojo.Event.tap, this.previousArticle = this.previousArticle.bind(this))
    this.controller.listen("next-article", Mojo.Event.tap, this.nextArticle = this.nextArticle.bind(this))
    this.controller.listen("starred", Mojo.Event.tap, this.setStarred = this.setStarred.bind(this))
    this.controller.listen("read", Mojo.Event.tap, this.setRead = this.setRead.bind(this))
    this.controller.listen("sendto", Mojo.Event.tap, this.sendTo = this.sendTo.bind(this))
    this.controller.listen("header", Mojo.Event.tap, this.openInBrowser = this.openInBrowser.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("previous-article", Mojo.Event.tap, this.previousArticle)
    this.controller.stopListening("next-article", Mojo.Event.tap, this.nextArticle)
    this.controller.stopListening("starred", Mojo.Event.tap, this.setStarred)
    this.controller.stopListening("read", Mojo.Event.tap, this.setRead)
    this.controller.stopListening("sendto", Mojo.Event.tap, this.sendTo)
    this.controller.stopListening("header", Mojo.Event.tap, this.openInBrowser)
  },

  ready: function($super) {
    $super()
    this.controller.get("title").update(this.article.title)
    this.controller.get("subscription").update(this.article.origin)
    this.controller.get("author").update(this.article.author ? "by " + this.article.author : "")
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
    var items = [
      {label: "Google", items: [
        {label: (this.article.isShared ? "Unshare" : "Share"), command: (this.article.isShared ? "unshare-with-google" : "share-with-google")}
      ]},

      {label: "Twitter", items: [
        {label: "Bad Kitty", command: "send-to-bad-kitty"}
      ]},

      {label: "Share", items: [
        {label: "Email", command: "send-to-email"},
        {label: "SMS", command: "send-to-sms"}
      ]},

      {label: "Read Later", items: [
        {label: "Relego", command: "send-to-relego"},
        {label: "Spare Time", command: "send-to-spare-time"}
      ]}
    ]

    this.controller.popupSubmenu({
      placeNear: $("sendto"),
      items: items,

      onChoose: function(command) {
        switch(command) {
          case "share-with-google":
            this.shareWithGoogle()
            break

          case "unshare-with-google":
            this.unshareWithGoogle()
            break

          case "send-to-spare-time":
            this.sendToSpareTime()
            break

          case "send-to-relego":
            this.sendToRelego()
            break

          case "send-to-bad-kitty":
            this.sendToBadKitty()
            break

          case "send-to-email":
            this.sendToEmail()
            break

          case "send-to-sms":
            this.sendToSms()
            break
        }
      }.bind(this)
    })
  },

  shareWithGoogle: function() {
    this.article.turnShareOn(function() {
      Feeder.notify("Article shared.")
    })
  },

  unshareWithGoogle: function() {
    this.article.turnShareOff(function() {
      Feeder.notify("Article unshared.")
    })
  },

  sendToBadKitty: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
        id: "com.superinhuman.badkitty",
        params: {action: "tweet", tweet: this.article.title + "\n\n" + this.article.url}
      },

      onFailure: this.offerToInstallApp.bind(this, "Bad Kitty", "com.superinhuman.badkitty")
    })
  },

  sendToSpareTime: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
        id: "com.semicolonapps.sparetime",
        params: {action: "add_url", url: this.article.url, title: this.article.title}
      },

      onFailure: this.offerToInstallApp.bind(this, "Spare Time", "com.semicolonapps.sparetime")
    })
  },

  sendToRelego: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
  			id: "com.webosroundup.relego",
  			params: {action: 'addtorelego', url: this.article.url, title: this.article.title}
      },

      onFailure: this.offerToInstallApp.bind(this, "Relego", "com.webosroundup.relego")
    })
  },

  sendToEmail: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
  			id: "com.palm.app.email",
        params: {summary: this.article.title, text: this.article.title + "\n\n" + this.article.url}
      }
    })
  },

  sendToSms: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
  			id: "com.palm.app.messaging",
        params: {messageText: this.article.title + "\n\n" + this.article.url}
      }
    })
  },

  offerToInstallApp: function(name, id) {
    this.controller.showAlertDialog({
      title: $L(name + " is not installed"),
      message: $L(name + " is not installed. Would you like to install it?"),

      choices:[
        {label:$L("Yes"), value:"yes", type:"affirmative"},
        {label:$L("No"), value:"no", type:"dismissal"}
      ],

      onChoose: function(value){
        if("yes" == value){
          this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method:"open",
            parameters:{target: "http://developer.palm.com/appredirect/?packageid=" + id}
          })
        }
      }
    })
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
    this.article.getPrevious(this.gotAnotherArticle.bind(this), this.loadingMoreArticles.bind(this, "previous-article"))
  },

  nextArticle: function() {
    this.article.getNext(this.gotAnotherArticle.bind(this), this.loadingMoreArticles.bind(this, "next-article"))
  },

  gotAnotherArticle: function(article) {
    if(article) {
      this.controller.stageController.swapScene("article", article)
    }
    else {
      this.controller.stageController.popScene()
    }
  },

  loadingMoreArticles: function(arrow) {
    this.controller.get(arrow).addClassName("working")
    this.workingSpinner.spinning = true
    this.controller.modelChanged(this.workingSpinner)
  }
})