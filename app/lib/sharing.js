var Sharing = {
  items: [
    {id: "sharing-aa", label: $L("Google"), defaultEnabled: true},
    {id: "sharing-ab", label: $L("Share"), command: "share-with-google", defaultEnabled: true},
    {id: "sharing-ac", label: $L("Twitter"), defaultEnabled: true},
    {id: "sharing-ad", label: $L("Bad Kitty"), command: "send-to-bad-kitty", defaultEnabled: true},
    {id: "sharing-ae", label: $L("Spaz"), command: "send-to-spaz", defaultEnabled: true},
    {id: "sharing-an", label: $L("Twee"), command: "send-to-twee", defaultEnabled: false},
    {id: "sharing-ao", label: $L("Tweed"), command: "send-to-tweed", defaultEnabled: false},
    {id: "sharing-af", label: $L("Share"), defaultEnabled: true},
    {id: "sharing-ag", label: $L("Facebook"), command: "send-to-facebook", defaultEnabled: true},
    {id: "sharing-ah", label: $L("Email"), command: "send-to-email", defaultEnabled: true},
    {id: "sharing-ai", label: $L("SMS"), command: "send-to-sms", defaultEnabled: true},
    {id: "sharing-ap", label: $L("neato!"), command: "send-to-neato", defaultEnabled: false},
    {id: "sharing-aj", label: $L("Read Later"), defaultEnabled: true},
    {id: "sharing-ak", label: $L("Relego"), command: "send-to-relego", defaultEnabled: true},
    {id: "sharing-al", label: $L("Spare Time"), command: "send-to-spare-time", defaultEnabled: true},
    {id: "sharing-am", label: $L("Instapaper"), command: "send-to-instapaper", defaultEnabled: true}
  ],

  getPopupFor: function(article) {
    var sortOrder = Preferences.getSharingOptionsSortOrder()
    console.log(sortOrder)

    if(sortOrder.length) {
      sortOrder.each(function(id, i) {
        Sharing.items.each(function(item) {
          if(item.id == id) {
            item.sortKey = i
            throw $break
          }
        })
      })

      Sharing.items = Sharing.items.sortBy(function(i) {return i.sortKey})
    }

    var popupItems = []
    var parentGroup

    var addGroup = function(group) {
      if(parentGroup && parentGroup.items) {
        popupItems.push(parentGroup)
      }

      parentGroup = group
    }

    var addItem = function(item) {
      if(parentGroup) {
        parentGroup.items = parentGroup.items || []
        parentGroup.items.push(item)
      }
      else {
        popupItems.push(item)
      }
    }

    Sharing.items.each(function(item) {
      if(Preferences.isSharingOptionEnabled(item.id, item.defaultEnabled)) {
        item = Object.clone(item)

        if(item.command) {
          if(item.command == "share-with-google" && article.isShared) {
            item.command = "unshare-with-google"
            item.label = $L("Unshare")
          }

          addItem(item)
        }
        else {
          addGroup(item)
        }
      }
    })

    if(parentGroup && parentGroup.items) {
      popupItems.push(parentGroup)
    }

    popupItems.push({label: $L("Configure..."), command: "configure"})

    return popupItems
  },

  handleSelection: function(article, controller, command) {
    switch(command) {
      case "share-with-google":   Sharing.shareWithGoogle(article, controller); break;
      case "unshare-with-google": Sharing.unshareWithGoogle(article, controller); break;
      case "send-to-instapaper":  Sharing.sendToInstapaper(article, controller); break;
      case "send-to-spare-time":  Sharing.sendToSpareTime(article, controller); break;
      case "send-to-relego":      Sharing.sendToRelego(article, controller); break;
      case "send-to-bad-kitty":   Sharing.sendToBadKitty(article, controller); break;
      case "send-to-spaz":        Sharing.sendToSpaz(article, controller); break;
      case "send-to-twee":        Sharing.sendToTwee(article, controller); break;
      case "send-to-tweed":       Sharing.sendToTweed(article, controller); break;
      case "send-to-email":       Sharing.sendToEmail(article, controller); break;
      case "send-to-sms":         Sharing.sendToSms(article, controller); break;
      case "send-to-neato":       Sharing.sendToNeato(article, controller); break;
      case "send-to-facebook":    Sharing.sendToFacebook(article, controller); break;
      case "configure":           controller.stageController.pushScene("configure-sharing", Sharing.items)
    }
  },

  shareWithGoogle: function(article, controller) {
    article.turnShareOn(function() {
      Feeder.notify($L("Article shared"))
    })
  },

  unshareWithGoogle: function(article, controller) {
    article.turnShareOff(function() {
      Feeder.notify($L("Article unshared"))
    })
  },

  sendToFacebook: function(article, controller) {
    Sharing.sendToApp(controller, $L("Facebook"), "com.palm.app.facebook", {status: article.title + "\n\n" + article.url})
  },

  sendToBadKitty: function(article, controller) {
    Sharing.sendToApp(controller, $L("Bad Kitty"), "com.superinhuman.badkitty", {action: "tweet", tweet: article.title + "\n\n" + article.url})
  },

  sendToSpaz: function(article, controller) {
    Sharing.sendToApp(controller, $L("Spaz"), "com.funkatron.app.spaz", {action: "prepPost", tweet: article.title + "\n\n" + article.url})
  },

  sendToTwee: function(article, controller) {
    Sharing.sendToApp(controller, $L("Twee"), "com.deliciousmorsel.twee", {tweet: article.title + "\n\n" + article.url})
  },

  sendToTweed: function(article, controller) {
    Sharing.sendToApp(controller, $L("Tweed"), "com.pivotallabs.tweed.us", {newTweet: article.title + "\n\n" + article.url})
  },

  sendToInstapaper: function(article, controller) {
    var success = function() {
      Feeder.notify($L("Article saved to Instapaper"))
    }

    var credentials = function() {
      controller.stageController.pushScene("instapaper-credentials", Sharing.sendToInstapaper.curry(article, controller))
    }

    var failure = function() {
      Feeder.notify($L("Unable to save article"))
    }

    Instapaper.send(article.url, article.title, success, credentials, failure)
  },

  sendToSpareTime: function(article, controller) {
    Sharing.sendToApp(controller, $L("Spare Time"), "com.semicolonapps.sparetime", {action: "add_url", url: article.url, title: article.title})
  },

  sendToRelego: function(article, controller) {
    Sharing.sendToApp(controller, $L("Relego"), "com.webosroundup.relego", {action: 'addtorelego', url: article.url, title: article.title})
  },

  sendToEmail: function(article, controller) {
    Sharing.sendToApp(controller, $L("Email"), "com.palm.app.email", {summary: article.title, text: article.title + "\n\n" + article.url})
  },

  sendToSms: function(article, controller) {
    Sharing.sendToApp(controller, $L("Messaging"), "com.palm.app.messaging", {messageText: article.title + "\n\n" + article.url})
  },

  sendToNeato: function(article, controller) {
    Sharing.sendToApp(controller, $L("neato!"), "com.zhephree.neato", {send: '{"a":"url","c":"' + article.url + '"}'})
  },

  sendToApp: function(controller, appName, id, params) {
    controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "open",
      parameters: {id: id, params: params},
      onFailure: Sharing.offerToInstallApp.curry(appName, id, controller)
    })
  },

  offerToInstallApp: function(name, id, controller) {
    controller.showAlertDialog({
      title:$L("#{app} is not installed").interpolate({app: name}),
      message: $L("#{app} is not installed. Would you like to install it?").interpolate({app: name}),

      choices:[
        {label:$L("Yes"), value:"yes", type:"affirmative"},
        {label:$L("No"), value:"no", type:"dismissal"}
      ],

      onChoose: function(value){
        if("yes" == value){
          controller.serviceRequest("palm://com.palm.applicationManager", {
            method:"open",
            parameters:{target: "http://developer.palm.com/appredirect/?packageid=" + id}
          })
        }
      }
    })
  }
}

