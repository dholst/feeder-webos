var PreferencesAssistant = Class.create(BaseAssistant, {
  initialize: function($super) {
    $super()
    this.hidePreferences = true

    this.sortOrder = {value: (Preferences.isOldestFirst() ? "oldest" : "newest")}
    this.originalSortOrder = Preferences.isOldestFirst()

    this.hideRead = {value: Preferences.hideRead()}
    this.originalHideRead = Preferences.hideRead()
  },

  setup: function($super) {
    $super()

    var sortChoices = {choices: [
      {label: "Sort newest first", value: "newest"},
      {label: "Sort oldest first", value: "oldest"}
    ]}

    this.controller.setupWidget("article-sort", sortChoices, this.sortOrder)
    this.controller.listen("article-sort", Mojo.Event.propertyChange, this.setSortOrder = this.setSortOrder.bind(this))

    this.controller.setupWidget("hide-read", {}, this.hideRead)
    this.controller.listen("hide-read", Mojo.Event.propertyChange, this.setHideRead = this.setHideRead.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("article-sort", Mojo.Event.propertyChange, this.setSortOrder)
    this.controller.stopListening("hide-read", Mojo.Event.propertyChange, this.setHideRead)
  },

  setSortOrder: function() {
    Preferences.setOldestFirst(this.sortOrder.value == "oldest")
  },

  setHideRead: function() {
    Preferences.setHideRead(this.hideRead.value)
  },

  handleCommand: function($super) {
    if(Mojo.Event.back) {
      event.stop();

      changes = {}

      if(this.originalSortOrder != Preferences.isOldestFirst()) {
        changes.sortOrderChanged = true
      }

      if(this.originalHideRead != Preferences.hideRead()) {
        changes.hideReadChanged = true
      }

      this.controller.stageController.popScene(changes)
    }
    else {
      $super()
    }
  }
})