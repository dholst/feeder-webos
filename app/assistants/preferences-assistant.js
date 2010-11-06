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

    this.fontSize = {value: Preferences.fontSize()}
    this.originalFontSize = Preferences.fontSize()

    this.combineFolders = {value: Preferences.combineFolders()}

    this.feedSortOrder = {value: (Preferences.isManualFeedSort() ? "manual" : "alphabetical")}
    this.originalFeedSortOrder = Preferences.isManualFeedSort()

    this.theme = {value: Preferences.getTheme()}
    this.originalTheme = Preferences.getTheme()

    this.debug = {value: Preferences.isDebugging()}
    
    this.markReadScroll = {value: Preferences.markReadAsScroll()}
  },

  setup: function($super) {
    $super()

    var sortChoices = {choices: [
      {label: $L("Sort newest first"), value: "newest"},
      {label: $L("Sort oldest first"), value: "oldest"}
    ]}

    var fontSizeChoices = {choices: [
      {label: $L("Small Font"), value: "small"},
      {label: $L("Medium Font"), value: "medium"},
      {label: $L("Large Font"), value: "large"}
    ]}

    var feedSortChoices = {choices: [
      {label: $L("Sort alphabetically"), value: "alphabetical"},
      {label: $L("Sort manually"), value: "manual"}
    ]}

    var themeChoices = {choices: [
      {label: $L("Grey Theme"), value: "grey"},
      {label: $L("Light Theme"), value: "light"}
    ]}

    this.controller.setupWidget("allow-landscape", {}, this.allowLandscape)
    this.controller.listen("allow-landscape", Mojo.Event.propertyChange, this.setAllowLandscape = this.setAllowLandscape.bind(this))

    this.controller.setupWidget("article-sort", sortChoices, this.sortOrder)
    this.controller.listen("article-sort", Mojo.Event.propertyChange, this.setSortOrder = this.setSortOrder.bind(this))

    this.controller.setupWidget("font-size", fontSizeChoices, this.fontSize)
    this.controller.listen("font-size", Mojo.Event.propertyChange, this.setFontSize = this.setFontSize.bind(this))

    this.controller.setupWidget("hide-read-feeds", {}, this.hideReadFeeds)
    this.controller.listen("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds = this.setHideReadFeeds.bind(this))

    this.controller.setupWidget("hide-read-articles", {}, this.hideReadArticles)
    this.controller.listen("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles = this.setHideReadArticles.bind(this))

    this.controller.setupWidget("back-after-mark-read", {}, this.backAfterMarkRead)
    this.controller.listen("back-after-mark-read", Mojo.Event.propertyChange, this.setBackAfterMarkRead = this.setBackAfterMarkRead.bind(this))

    this.controller.setupWidget("combine-folders", {}, this.combineFolders)
    this.controller.listen("combine-folders", Mojo.Event.propertyChange, this.setCombineFolders = this.setCombineFolders.bind(this))

    this.controller.setupWidget("feed-sort", feedSortChoices, this.feedSortOrder)
    this.controller.listen("feed-sort", Mojo.Event.propertyChange, this.setFeedSortOrder = this.setFeedSortOrder.bind(this))

    this.controller.setupWidget("theme", themeChoices, this.theme)
    this.controller.listen("theme", Mojo.Event.propertyChange, this.setTheme = this.setTheme.bind(this))

    this.controller.setupWidget("debug", {}, this.debug)
    this.controller.listen("debug", Mojo.Event.propertyChange, this.setDebugging = this.setDebugging.bind(this))

    this.controller.setupWidget("mark-read-scroll", {}, this.markReadScroll)
    this.controller.listen("mark-read-scroll", Mojo.Event.propertyChange, this.setMarkReadScroll = this.setMarkReadScroll.bind(this))

    $("header").update($L("Preferences"))
    $("general-label").update($L("General"))
    $("landscape-label").update($L("Allow landscape"))
    $("feeds-label").update($L("Feeds"))
    $("hide-read-feeds-label").update($L("Hide read feeds"))
    $("back-after-mark-read-label").update($L("Go back after mark all read"))
    $("articles-label").update($L("Articles"))
    $("hide-read-articles-label").update($L("Hide read articles"))
    $("folders-label").update($L("Folders"))
    $("combine-articles-label").update($L("Combine articles"))
    $("debug-label").update($L("Debug Log"))
    $("mark-read-scroll-label").update($L("Mark read as you scroll"))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("allow-landscape", Mojo.Event.propertyChange, this.setAllowLandscape)
    this.controller.stopListening("article-sort", Mojo.Event.propertyChange, this.setSortOrder)
    this.controller.stopListening("hide-read-feeds", Mojo.Event.propertyChange, this.setHideReadFeeds)
    this.controller.stopListening("hide-read-articles", Mojo.Event.propertyChange, this.setHideReadArticles)
    this.controller.stopListening("back-after-mark-read", Mojo.Event.propertyChange, this.setBackAfterMarkRead)
    this.controller.stopListening("combine-folders", Mojo.Event.propertyChange, this.setCombineFolders)
    this.controller.stopListening("feed-sort", Mojo.Event.propertyChange, this.setFeedSortOrder)
    this.controller.stopListening("theme", Mojo.Event.propertyChange, this.setTheme)
    this.controller.stopListening("debug", Mojo.Event.propertyChange, this.setDebugging)
    this.controller.stopListening("mark-read-scroll", Mojo.Event.propertyChange, this.setMarkReadScroll)
  },

  setAllowLandscape: function() {
    Preferences.setAllowLandscape(this.allowLandscape.value)
  },

  setSortOrder: function() {
    Preferences.setOldestFirst(this.sortOrder.value == "oldest")
  },

  setFontSize: function() {
    Preferences.setFontSize(this.fontSize.value)
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

  setCombineFolders: function() {
    Preferences.setCombineFolders(this.combineFolders.value)
  },

  setFeedSortOrder: function() {
    Preferences.setManualFeedSort(this.feedSortOrder.value == "manual")
  },

  setTheme: function() {
    Preferences.setTheme(this.theme.value)

    $w(document.body.className).each(function(className) {
      if(className.startsWith("theme-")) {
        $(document.body).removeClassName(className)
      }
    })

    $(document.body).addClassName("theme-" + Preferences.getTheme())
  },

  setDebugging: function() {
    Preferences.setDebugging(this.debug.value)
  },
  
  setMarkReadScroll: function() {
    Preferences.setMarkReadAsScroll(this.markReadScroll.value)
  },

  handleCommand: function($super, event) {
    if(Mojo.Event.back == event.type) {
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

      if(this.originalFontSize != Preferences.fontSize()) {
        changes.fontSizeChanged = true
      }

      if(this.originalFeedSortOrder != Preferences.isManualFeedSort()) {
        changes.feedSortOrderChanged = true
      }

      if(this.originalTheme != Preferences.getTheme()) {
        changes.themeChanged = true
      }

      this.controller.stageController.popScene(changes)
    }
    else {
      $super(event)
    }
  }
})