var PreferencesAssistant = Class.create(BaseAssistant, {
  initialize: function($super) {
    $super()
    this.hidePreferences = true
    this.sortOrder = {value: (Preferences.isOldestFirst() ? "oldest" : "newest")}
    this.originalSortOrder = Preferences.isOldestFirst()
  },

  setup: function($super) {
    $super()

    var sortChoices = {choices: [
      {label: "Sort newest first", value: "newest"},
      {label: "Sort oldest first", value: "oldest"}
    ]}

    this.controller.setupWidget("article-sort", sortChoices, this.sortOrder)
    this.controller.listen("article-sort", Mojo.Event.propertyChange, this.setSortOrder = this.setSortOrder.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("article-sort", Mojo.Event.propertyChange, this.setSortOrder)
  },

  setSortOrder: function() {
    Preferences.setOldestFirst(this.sortOrder.value == "oldest")
  },

  handleCommand: function($super) {
    if(Mojo.Event.back) {
      event.stop();

      changes = {}

      if(this.originalSortOrder != Preferences.isOldestFirst()) {
        changes.sortOrderChanged = true
      }

      this.controller.stageController.popScene(changes)
    }
    else {
      $super()
    }
  }
})