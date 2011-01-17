var AddListAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api, subscriptions) {
    $super()
    this.api = api
    this.subscriptions = {items: subscriptions.map(this.buildSubscription)}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("subscriptions", {itemTemplate: "add-list/subscription"}, this.subscriptions)
    this.controller.listen("subscriptions", Mojo.Event.listTap, this.showSubscription = this.showSubscription.bind(this))
    this.controller.get("header").update($L("Add Subscription"))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("subscriptions", Mojo.Event.listTap, this.showSubscription)
  },

  showSubscription: function(event) {
    this.controller.stageController.pushScene("add-detail", this.api, event.item)
  },

  buildSubscription: function(json) {
    console.log(Object.toJSON(json))
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

