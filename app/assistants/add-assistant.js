var AddAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.query = {value: ""}
    this.searchButton = {buttonLabel: $L("Add")}
    this.cancelButton = {buttonLabel: $L("Cancel")}
    this.subscriptions = {items: []}
    this.firstTime = true
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("query", {changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase, hintText: $L("URL or query")}, this.query)
    this.controller.setupWidget("search-submit", {type: Mojo.Widget.activityButton}, this.searchButton)
    this.controller.setupWidget("search-cancel", {}, this.cancelButton)
    this.controller.setupWidget("subscriptions", {itemTemplate: "add/subscription"}, this.subscriptions)

    this.controller.listen("query", Mojo.Event.propertyChange, this.propertyChanged = this.propertyChanged.bind(this))
    this.controller.listen("search-icon", Mojo.Event.tap, this.searchIconTap = this.searchIconTap.bind(this))
    this.controller.listen("search-submit", Mojo.Event.tap, this.search = this.search.bind(this))
    this.controller.listen("search-cancel", Mojo.Event.tap, this.cancel = this.cancel.bind(this))
    this.controller.listen("subscriptions", Mojo.Event.listTap, this.showSubscription = this.showSubscription.bind(this))

    this.controller.get("header").update($L("Add Subscription"))
  },

  activate: function($super) {
    $super()

    if(this.firstTime) {
      this.menuPanelOn()
      this.controller.get("query").mojo.setConsumesEnterKey(false)
      this.controller.get("query").mojo.focus()
      this.firstTime = false
    }
  },

  cleanup: function($super) {
    $super()

    this.controller.stopListening("query", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("search-icon", Mojo.Event.tap, this.searchIconTap)
    this.controller.stopListening("search-submit", Mojo.Event.tap, this.search)
    this.controller.stopListening("search-cancel", Mojo.Event.tap, this.cancel)
    this.controller.stopListening("subscriptions", Mojo.Event.listTap, this.showSubscription)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.search()
    }
  },

  cancel: function() {
    this.menuPanelOff()
  },

  search: function() {
    this.controller.get("search-failure").hide()
    this.controller.get("search-submit").mojo.disabled = true
    this.controller.get("search-submit").mojo.activate()
    this.controller.modelChanged(this.searchButton)
    this.api.addSubscription(this.query.value, this.subscriptionAdded.bind(this), this.subscriptionAddFailure.bind(this))
  },

  subscriptionAdded: function() {
    Feeder.notify($L("Subscription added"))
    this.controller.stageController.popScene()
  },

  subscriptionAddFailure: function() {
    this.api.searchSubscriptions(this.query.value, this.subscriptionsFound.bind(this), this.subscriptionSearchFailure.bind(this))
  },

  subscriptionsFound: function(subscriptions) {
    this.subscriptions.items.clear()
    this.controller.get("search-submit").mojo.disabled = false
    this.controller.get("search-submit").mojo.deactivate()
    this.controller.modelChanged(this.searchButton)

    subscriptions.each(function(subscription) {
      this.subscriptions.items.push(this.buildSubscription(subscription))
    }.bind(this))

    this.controller.modelChanged(this.subscriptions)
    this.menuPanelOff()

    if(this.subscriptions.items.length === 0) {
      this.controller.get("error-message").update($L("No subscriptions found"))
      this.controller.get("search-failure").show()
    }
  },

  subscriptionSearchFailure: function() {
    this.controller.get("search").mojo.disabled = false
    this.controller.get("search").mojo.deactivate()
    this.controller.modelChanged(this.searchButton)
    this.menuPanelOff()
    this.controller.get("error-message").update($L("Unable to add subscription"))
    this.controller.get("search-failure").show()
  },

  searchIconTap: function() {
    this.menuPanelOn()
    this.controller.get("query").mojo.focus()
  },

  showSubscription: function(event) {
    this.controller.stageController.pushScene("add-detail", this.api, event.item)
  },

  buildSubscription: function(json) {
    var subscription = {}
    subscription.title = json.title

    if(json.content && json.content.content) {
      subscription.content = json.content.content
    }

    if(json.feed && json.feed.length && json.feed[0].href) {
      subscription.url = json.feed[0].href
    }

    return subscription
  }
})
