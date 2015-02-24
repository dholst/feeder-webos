var FolderSubscriptions = Class.create(SubscriptionContainer, {
  initialize: function($super, api, stream) {
    $super(api)
    this.subscriptionOrderingStream = stream
  }
})