var FeedsAssistant = Class.create(BaseAssistant, {
  initialize: function($super, google) {
    $super()
    this.google = google
    this.feeds = {items: []}
  },
  
  setup: function($super) {
    $super()
    this.controller.setupWidget("feeds", {itemTemplate: "feeds/feed"}, this.feeds)
    this.controller.listen("feeds", Mojo.Event.listTap, this.feedTapped = this.feedTapped.bind(this))
  },
  
  cleanup: function($super) {
    $super()
    this.controller.stopListening("feeds", Mojo.Event.listTap, this.feedTapped)
  },
  
  activate: function($super) {
    $super()
    this.spinnerOn("retrieving feeds...")
    this.google.allFeeds(this.foundFeeds.bind(this), this.bail.bind(this))
  },
  
  foundFeeds: function(feeds) {
    this.feeds.items.clear()
    this.feeds.items.push.apply(this.feeds.items, feeds.select(function(feed) {return feed.unreadCount}))
    this.controller.modelChanged(this.feeds)
    this.spinnerOff()
  },
  
  feedTapped: function(event) {
    this.controller.stageController.pushScene("feed", this.google, event.item)
  }
})