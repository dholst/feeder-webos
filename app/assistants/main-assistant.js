var MainAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api) {
    $super()
    this.subscriptions = new Subscriptions(api)
  },
  
  setup: function($super) {
    $super()
    this.controller.setupWidget("subscriptions", {itemTemplate: "main/subscription"}, this.subscriptions)
    this.controller.listen("subscriptions", Mojo.Event.listTap, this.feedTapped = this.subscriptionTapped.bind(this))
  },
  
  cleanup: function($super) {
    $super()
    this.controller.stopListening("subscriptions", Mojo.Event.listTap, this.subscriptionTapped)
  },
  
  activate: function($super) {
    $super()
    this.spinnerOn("retrieving subscriptions...")
    this.subscriptions.findAll(this.foundSubscriptions.bind(this), this.bail.bind(this))
  },
  
  foundSubscriptions: function(feeds) {
    this.controller.modelChanged(this.subscriptions)
    this.spinnerOff()
  },
  
  subscriptionTapped: function(event) {
    this.controller.stageController.pushScene("subscription", event.item)
  }
})