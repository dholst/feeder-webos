var AddAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.url = {value: ""}
    this.button = {buttonLabel: $L("Add")}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("url", {changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase}, this.url)
    this.controller.setupWidget("add", {type: Mojo.Widget.activityButton}, this.button)

		this.controller.listen("url", Mojo.Event.propertyChange, this.propertyChanged = this.propertyChanged.bind(this))
    this.controller.listen("add", Mojo.Event.tap, this.add = this.add.bind(this))

    $("header").update($L("Add Subscription"))
    $("url-label").update($L("URL"))
    $("error-message").update($L("Unable to add subscription"))
  },

  activate: function($super) {
    $super()
    $("url").mojo.setConsumesEnterKey(false)
  },

  cleanup: function($super) {
    $super()

		this.controller.stopListening("url", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("add", Mojo.Event.tap, this.add)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.add()
    }
  },

  add: function() {
    $("add").mojo.disabled = true
    $("add").mojo.activate()
    this.controller.modelChanged(this.button)
    this.api.addSubscription(this.url.value, this.subscriptionAddSuccess.bind(this), this.subscriptionAddFailure.bind(this))
  },

  subscriptionAddSuccess: function() {
    this.controller.stageController.popScene({feedAdded: true})
  },

  subscriptionAddFailure: function() {
    $("add-failure").show()
    $("add").mojo.disabled = false
    $("add").mojo.deactivate()
    this.controller.modelChanged(this.button)
  }
})
