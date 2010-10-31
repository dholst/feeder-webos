var ArticleAssistant = Class.create(BaseAssistant, {
  initialize: function($super, article, scrollingIndex) {
    $super()
    this.article = article
    this.scrollingIndex = scrollingIndex
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
    this.removeAnchorFix()
    this.removeLoadImage()
  },

  activate: function($super, changes) {
    $super()

    if(changes && changes.fontSizeChanged) {
      this.setFontSize()
    }
  },

  ready: function($super) {
    $super()
    this.controller.get("title").update(this.article.title)
    this.controller.get("subscription").update(this.article.origin)
    this.controller.get("author").update(this.article.author ? $L("by ") + this.article.author : "")
    this.controller.get("summary").update(this.article.summary)
    this.setFontSize()

    if(this.article.isRead) {
      this.controller.get("read").addClassName("on")
    }

    if(this.article.isStarred) {
      this.controller.get("starred").addClassName("on")
    }

    if(!this.article.isRead && !this.article.keepUnread) {
      this.toggleState(this.controller.get("read"), "Read")
    }

    this.addAnchorFix()
    this.addLoadImage()
  },

  setFontSize: function() {
    var summary = this.controller.get("summary")
    summary.removeClassName("small")
    summary.removeClassName("medium")
    summary.removeClassName("large")
    summary.addClassName(Preferences.fontSize())
  },

  setStarred: function(event) {
    this.toggleState(event.target, "Star")
  },

  setRead: function(event) {
    this.toggleState(event.target, "Read", true)
  },

  toggleState: function(target, state, sticky) {
    if(!target.hasClassName("working")) {
      target.addClassName("working")

      var onComplete = function(success) {
        target.removeClassName("working")

        if(success) {
          target.toggleClassName("on")
        }
      }

      this.article["turn" + state + (target.hasClassName("on") ? "Off" : "On")](onComplete, sticky)
    }
  },

  sendTo: function(event) {
    var items = [
      {label: $L("Google"), items: [
        {label: (this.article.isShared ? $L("Unshare") : $L("Share")), command: (this.article.isShared ? "unshare-with-google" : "share-with-google")}
      ]},

      {label: $L("Twitter"), items: [
        {label: $L("Bad Kitty"), command: "send-to-bad-kitty"}
      ]},

      {label: $L("Share"), items: [
        {label: $L("Email"), command: "send-to-email"},
        {label: $L("SMS"), command: "send-to-sms"}
      ]},

      {label: $L("Read Later"), items: [
        {label: $L("Relego"), command: "send-to-relego"},
        {label: $L("Spare Time"), command: "send-to-spare-time"}
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
      Feeder.notify($L("Article shared."))
    })
  },

  unshareWithGoogle: function() {
    this.article.turnShareOff(function() {
      Feeder.notify($L("Article unshared."))
    })
  },

  sendToBadKitty: function() {
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",

      parameters: {
        id: "com.superinhuman.badkitty",
        params: {action: "tweet", tweet: this.article.title + "\n\n" + this.article.url}
      },

      onFailure: this.offerToInstallApp.bind(this, $L("Bad Kitty"), "com.superinhuman.badkitty")
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

      onFailure: this.offerToInstallApp.bind(this, $L("Relego"), "com.webosroundup.relego")
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
      title: name + $L(" is not installed"),
      message: name + $L(" is not installed. Would you like to install it?"),

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
    this.scrollingIndex = this.scrollingIndex - 1
    this.article.getPrevious(this.gotAnotherArticle.bind(this), this.loadingMoreArticles.bind(this, "previous-article"))
  },

  nextArticle: function() {
    this.scrollingIndex = this.scrollingIndex + 1
    this.article.getNext(this.gotAnotherArticle.bind(this), this.loadingMoreArticles.bind(this, "next-article"))
  },

  gotAnotherArticle: function(article) {
    if(article) {
      this.controller.stageController.swapScene({name: "article", transition: Mojo.Transition.crossFade}, article, this.scrollingIndex)
    }
    else {
      this.controller.stageController.popScene(this.scrollingIndex < 0 ? "top" : "bottom")
    }
  },

  loadingMoreArticles: function(arrow) {
    this.controller.get(arrow).addClassName("working")
    this.workingSpinner.spinning = true
    this.controller.modelChanged(this.workingSpinner)
  },

  handleCommand: function($super, event) {
    if(Mojo.Event.back == event.type) {
      event.stop()
      this.controller.stageController.popScene(this.scrollingIndex)
    }
    else {
      $super(event)
    }
  },

  loadImage: function(event) {
		var img = event.target || event.srcElement

    this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",
      parameters: {
        id: "com.palm.app.browser",
        params: {
          target: img.src
        }
      }
    })
  },

  addLoadImage: function() {
    this.loadImage = this.loadImage.bind(this)

    $$("#summary img").each(function(img) {
      img.observe(Mojo.Event.hold, this.loadImage)
    }.bind(this))
  },

  removeLoadImage: function() {
    $$("#summary img").each(function(img) {
      img.stopObserving(Mojo.Event.hold, this.loadImage)
    }.bind(this))
  },

  //
  // Prevent tapping link while scrolling, from http://github.com/deliciousmorsel/Feeds/blob/master/app/assistants/view-article-assistant.js
  //

  getTimestamp: function() {
    var d = new Date();
    return Math.floor(d.getTime() / 1000);
  },

  addAnchorFix: function() {
    this.anchorTap = this.anchorTap.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragging = this.onDragging.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)

    $$("#summary a").each(function(anchor) {
      anchor.observe('click' , this.anchorTap)
    }.bind(this))

    var scroller = this.controller.getSceneScroller()
    scroller.observe(Mojo.Event.dragStart , this.onDragStart)
    scroller.observe(Mojo.Event.dragging , this.onDragging)
    scroller.observe(Mojo.Event.dragEnd , this.onDragEnd)
    scroller.observe('mouseup' , this.onMouseUp)
  },

  removeAnchorFix: function() {
    $$("#summary a").each(function(anchor) {
      anchor.stopObserving('click' , this.anchorTap)
    }.bind(this))

    var scroller = this.controller.getSceneScroller()
    scroller.stopObserving(Mojo.Event.dragStart , this.onDragStart)
    scroller.stopObserving(Mojo.Event.dragging , this.onDragging)
    scroller.stopObserving(Mojo.Event.dragEnd , this.onDragEnd)
    scroller.stopObserving('mouseup' , this.onMouseUp)
  },

  anchorTap: function(e) {
    if(this.lastDrag && this.lastDrag > this.getTimestamp() - 1) {
      e.preventDefault()
      e.stop()
      return false
    }
  },

  onDragStart: function(e) {
    this.lastDrag = this.getTimestamp()
    this.dragLocation = {start: {x:e.move.clientX , y:e.move.clientY , timeStamp: this.lastDrag}}
  },

  onDragging: function(e) {
    this.lastDrag = this.getTimestamp()

    if (this.dragLocation && this.dragLocation.start && Math.abs(e.move.clientY - this.dragLocation.start.y) > 80) {
      this.dragLocation = false
    }
    else {
      this.dragLocation.last = {x:e.move.clientX , y:e.move.clientY , timeStamp: this.lastDrag}
    }
  },

  onMouseUp: function(e) {
    if (!this.dragLocation || Math.abs(this.dragLocation.last.y - this.dragLocation.start.y) > 80) {
      this.dragLocation = false
      return
    }

    if (Math.abs(this.dragLocation.last.x - this.dragLocation.start.x) > 50 && (this.dragLocation.last.timeStamp-2) < this.dragLocation.start.timeStamp) {
      if ((this.dragLocation.last.x - this.dragLocation.start.x) > 0) {
       this.previousArticle()
      }
      else {
       this.nextArticle()
      }
    }
    else {
      this.dragLocation = false
    }
  },

  onDragEnd: function(e) {
    this.lastDrag = this.getTimestamp()
    this.onMouseUp(e)
  }
})