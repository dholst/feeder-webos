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
    this.controller.listen("items", Mojo.Event.listTap, this.itemTapped = this.itemTapped.bind(this))
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
    this.controller.listen("items", Mojo.Event.listTap, this.itemTapped)
  },
    
  foundItems: function(items) {
    this.feedItems.items.clear()
    this.feedItems.items.push.apply(this.feedItems.items, items)
    this.controller.modelChanged(this.feedItems)
    this.spinnerOff()
  },
  
  itemTapped: function(event) {
    this.controller.stageController.pushScene("item", this.google, this.feed, event.item)    
  }
})