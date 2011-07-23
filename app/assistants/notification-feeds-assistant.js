var NotificationFeedsAssistant = Class.create(BaseAssistant, {
  initialize: function() {
    var watchedFeeds = Preferences.getWatchedFeeds()

    BaseAssistant.sources.subscriptions.items.each(function(subscription) {
      subscription.feedWatched = watchedFeeds.any(function(n) {return n == subscription.id})
    })
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("feed", {modelProperty: "feedWatched"})
    this.controller.setupWidget("feeds", {itemTemplate: "notification-feeds/feed"}, BaseAssistant.sources.subscriptions)
    this.controller.listen("feeds", Mojo.Event.propertyChange, this.feedTapped = this.feedTapped.bind(this))
    this.controller.get("header").update($L("Select feeds to watch"))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("feeds", Mojo.Event.propertyChange, this.feedTapped)
  },

  feedTapped: function(event) {
    if(event.value) {
      Preferences.addNotificationFeed(event.model.id)
    }
    else {
      Preferences.removeNotificationFeed(event.model.id)
    }
  }
})
