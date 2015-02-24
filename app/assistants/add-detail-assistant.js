var AddDetailAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api, subscription) {
    $super()
    this.api = api
    this.subscription = subscription
    this.button = {buttonLabel: $L("Add")}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("add", {type: Mojo.Widget.activityButton}, this.button)
    this.controller.get("title").update(this.subscription.title)
    this.controller.get("summary").update(this.subscription.url + "<br><br>" + this.subscription.content)
    this.controller.get("error-message").update($L("Unable to add subscription"))
    this.controller.listen("add", Mojo.Event.tap, this.add = this.add.bind(this))
  },

  add: function() {
    this.controller.get("add").mojo.disabled = true
    this.controller.get("add").mojo.activate()
    this.controller.modelChanged(this.button)
    this.api.addSubscription(this.subscription.url, this.subscriptionAdded.bind(this), this.subscriptionAddFailure.bind(this))
  },

  subscriptionAdded: function() {
    this.controller.stageController.popScene(true)
  },

  subscriptionAddFailure: function() {
    this.controller.get("add-failure").show()
    this.controller.get("add").mojo.disabled = false
    this.controller.get("add").mojo.deactivate()
    this.controller.modelChanged(this.button)
  }
})
