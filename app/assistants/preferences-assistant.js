var PreferencesAssistant = Class.create(BaseAssistant, {
  initialize: function($super) {
    $super()
    this.hidePreferences = true

    this.sortOrder = {value: (Preferences.isOldestFirst() ? "oldest" : "newest")}
    this.originalSortOrder = Preferences.isOldestFirst()

    this.hideReadFeeds = {value: Preferences.hideReadFeeds()}
    this.originalHideReadFeeds = Preferences.hideReadFeeds()

    this.hideReadArticles = {value: Preferences.hideReadArticles()}
    this.originalHideReadArticles = Preferences.hideReadArticles()
  },

  setup: function($super) {
    $super()

    var sortChoices = {choices: [
      {label: "Sort newest first", value: "newest"},
      {label: "Sort oldest first", value: "oldest"}
    ]}

    this.controller.setupWidget("article-sort", sortChoices, this.sortOrder)
    this.controller.listen("article-sort", Mojo.Event.propertyChange, this.setSortOrder = this.setSortOrder.bind(this))

    this.controller.setupWidget("hide-read-feeds", {}, this.hideReadFeeds)
    this.controller.listen("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds = this.setHideReadFeeds.bind(this))

    this.controller.setupWidget("hide-read-articles", {}, this.hideReadArticles)
    this.controller.listen("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles = this.setHideReadArticles.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("article-sort", Mojo.Event.propertyChange, this.setSortOrder)
    this.controller.stopListening("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds)
    this.controller.stopListening("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles)
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

  handleCommand: function($super) {
    if(Mojo.Event.back) {
      event.stop();

      changes = {}

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