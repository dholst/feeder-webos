var PreferencesAssistant = Class.create(BaseAssistant, {
  initialize: function($super) {
    $super()
    this.hidePreferences = true

    this.allowLandscape = {value: Preferences.allowLandscape()}
    this.originalAllowLandscape = Preferences.allowLandscape()

    this.sortOrder = {value: (Preferences.isOldestFirst() ? "oldest" : "newest")}
    this.originalSortOrder = Preferences.isOldestFirst()

    this.hideReadFeeds = {value: Preferences.hideReadFeeds()}
    this.originalHideReadFeeds = Preferences.hideReadFeeds()

    this.hideReadArticles = {value: Preferences.hideReadArticles()}
    this.originalHideReadArticles = Preferences.hideReadArticles()

    this.backAfterMarkRead = {value: Preferences.goBackAfterMarkAsRead()}
  },

  setup: function($super) {
    $super()

    var sortChoices = {choices: [
      {label: $L("Sort newest first"), value: "newest"},
      {label: $L("Sort oldest first"), value: "oldest"}
    ]}

    this.controller.setupWidget("allow-landscape", {}, this.allowLandscape)
    this.controller.listen("allow-landscape", Mojo.Event.propertyChange, this.setAllowLandscape = this.setAllowLandscape.bind(this))

    this.controller.setupWidget("article-sort", sortChoices, this.sortOrder)
    this.controller.listen("article-sort", Mojo.Event.propertyChange, this.setSortOrder = this.setSortOrder.bind(this))

    this.controller.setupWidget("hide-read-feeds", {}, this.hideReadFeeds)
    this.controller.listen("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds = this.setHideReadFeeds.bind(this))

    this.controller.setupWidget("hide-read-articles", {}, this.hideReadArticles)
    this.controller.listen("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles = this.setHideReadArticles.bind(this))

    this.controller.setupWidget("back-after-mark-read", {}, this.backAfterMarkRead)
    this.controller.listen("back-after-mark-read", Mojo.Event.propertyChange, this.setBackAfterMarkRead = this.setBackAfterMarkRead.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("allow-landscape", Mojo.Event.propertyChange, this.setAllowLandscape)
    this.controller.stopListening("article-sort", Mojo.Event.propertyChange, this.setSortOrder)
    this.controller.stopListening("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds)
    this.controller.stopListening("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles)
    this.controller.stopListening("back-after-mark-read", Mojo.Event.propertyChange, this.setBackAfterMarkRead)
  },

  setAllowLandscape: function() {
    Preferences.setAllowLandscape(this.allowLandscape.value)
  },

  setSortOrder: function() {
    Preferences.setOldestFirst(this.sortOrder.value == "oldest")
  },

  setHideReadFeeds: function() {
    Preferences.setHideReadFeeds(this.hideReadFeeds.value)
  },

  setHideReadArticles: function() {
    Preferences.setHideReadArticles(this.hideReadArticles.value)
  },

  setBackAfterMarkRead: function() {
    Preferences.setBackAfterMarkAsRead(this.backAfterMarkRead.value)
  },

  handleCommand: function($super) {
    if(Mojo.Event.back) {
      event.stop();

      changes = {}

      if(this.originalAllowLandscape != Preferences.allowLandscape()) {
        changes.allowLandscapeChanged = true
      }

      if(this.originalSortOrder != Preferences.isOldestFirst()) {
        changes.sortOrderChanged = true
      }

      if(this.originalHideReadFeeds != Preferences.hideReadFeeds()) {
        changes.hideReadFeedsChanged = true
      }

      if(this.originalHideReadArticles != Preferences.hideReadArticles()) {
        changes.hideReadArticlesChanged = true
      }

      this.controller.stageController.popScene(changes)
    }
    else {
      $super()
    }
  }
})