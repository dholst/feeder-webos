var AddAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.query = {value: ""}
    this.button = {buttonLabel: $L("Search")}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("query", {changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase}, this.query)
    this.controller.setupWidget("search", {type: Mojo.Widget.activityButton}, this.button)

    this.controller.listen("query", Mojo.Event.propertyChange, this.propertyChanged = this.propertyChanged.bind(this))
    this.controller.listen("search", Mojo.Event.tap, this.search = this.search.bind(this))

    this.controller.get("header").update($L("Add Subscription"))
    this.controller.get("query-label").update($L("Search"))
    this.controller.get("error-message").update($L("Unable to add subscription"))
  },

  activate: function($super) {
    $super()
    this.controller.get("query").mojo.setConsumesEnterKey(false)
  },

  cleanup: function($super) {
    $super()

    this.controller.stopListening("query", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("search", Mojo.Event.tap, this.search)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.search()
    }
  },

  search: function() {
    this.controller.get("search").mojo.disabled = true
    this.controller.get("search").mojo.activate()
    this.controller.modelChanged(this.button)
    this.api.searchSubscriptions(this.query.value, this.subscriptionsFound.bind(this), this.subscriptionSearchFailure.bind(this))
  },

  subscriptionsFound: function(subscriptions) {
    this.controller.get("search").mojo.disabled = false
    this.controller.get("search").mojo.deactivate()
    this.controller.stageController.pushScene("add-list", this.api, subscriptions)
  },

  subscriptionSearchFailure: function() {
    this.controller.get("search-failure").show()
    this.controller.get("search").mojo.disabled = false
    this.controller.get("search").mojo.deactivate()
    this.controller.modelChanged(this.button)
  }
})
