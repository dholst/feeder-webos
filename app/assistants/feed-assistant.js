var FeedAssistant = Class.create(BaseAssistant, {
  initialize: function($super, google, feed) {
    $super()
    this.google = google
    this.feed = feed
    this.feedItems = {items: []}
  },
  
  setup: function($super) {
    $super()
    this.controller.setupWidget("items", {itemTemplate: "feed/item"}, this.feedItems)
  },
  
  ready: function($super) {
    $super()
    this.controller.get("header").update(this.feed.title)
  },
  
  activate: function($super) {
    $super()
    this.spinnerOn("retrieving items...")
    this.google.allFeedItems(this.feed, this.foundItems.bind(this), this.bail.bind(this))
  },

  cleanup: function($super) {
    $super()
  },
    
  foundItems: function(items) {
    this.feedItems.items.clear()
    this.feedItems.items.push.apply(this.feedItems.items, items)
    this.controller.modelChanged(this.feedItems)
    this.spinnerOff()
  }
})