var NotificationFeedsAssistant = Class.create(BaseAssistant, {
  setup: function() {
    this.controller.setupWidget("feed", {}, {value: false})
    this.controller.setupWidget("feeds", {itemTemplate: "notification-feeds/feed"}, BaseAssistant.sources.subscriptions)
  }
})
