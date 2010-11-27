var BaseAssistant = Class.create({
  initialize: function() {
    this.smallSpinner = {spinning: false}
    this.searchText = {value: ""}
    this.startSearch = this.startSearch.bind(this)
  },

  setup: function() {
    this.setTheme()

    var appMenuItems = []
    appMenuItems.push(Mojo.Menu.editItem)

    if(!this.hideAppMenu) {
      if(this.showAddSubscription) {
        appMenuItems.push({label: $L("Add Subscription"), command: "add-subscription"})
      }

      if(!this.hidePreferences) {
        appMenuItems.push({label: $L("Preferences"), command: Mojo.Menu.prefsCmd})
      }

      if(!this.hideLogout) {
        appMenuItems.push({label: $L("Logout"), command: "logout"})
      }

      appMenuItems.push({label: $L("Help"), command: Mojo.Menu.helpCmd})

      if(Preferences.isDebugging()) {
        appMenuItems.push({label: $L("Debug Log"), command: "debug"})
      }
    }

    this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {visible: true, items: appMenuItems})
    this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, {})
    this.controller.setupWidget("small-spinner", {spinnerSize: "small"}, this.smallSpinner)
  },

  ready: function() {
  },

  readytoactivate: function() {
  },

  aboutToActivate: function(callback) {
    callback.defer()
  },

  activate: function(changes) {
    this.controller.stageController.setWindowOrientation(Preferences.allowLandscape() ? "free" : "up")
  },

  deactivate: function() {
  },

  cleanup: function() {
  },

  smallSpinnerOn: function() {
    this.smallSpinner.spinning = true
    this.controller.modelChanged(this.smallSpinner)
  },

  smallSpinnerOff: function() {
    this.smallSpinner.spinning = false
    this.controller.modelChanged(this.smallSpinner)
  },

  spinnerOn: function(message) {
    var spinner = this.controller.sceneElement.querySelector(".spinner")
    spinner.mojo.start()
    this.controller.get("spinner-scrim").show()

    var spinnerMessage = this.controller.get("spinner-message")

    if(!spinnerMessage) {
      spinner.insert({after: '<div id="spinner-message" class="spinner-message palm-info-text"></div>'})
      spinnerMessage = this.controller.get("spinner-message")
    }

    spinnerMessage.update(message || "")
  },

  spinnerOff: function() {
    var message = this.controller.get("spinner-message")

    if(message) {
      message.remove()
      this.controller.sceneElement.querySelector(".spinner").mojo.stop()
      this.controller.get("spinner-scrim").hide()
    }
  },

  refreshList: function(list, items) {
    list.mojo.noticeUpdatedItems(0, items)
    list.mojo.setLength(items.length)
  },

  handleCommand: function(event) {
    var handled = false

    if(Mojo.Event.command === event.type) {
      if("logout" == event.command) {
        this.controller.stageController.popScenesTo("home", "logout")
        handled = true
      }
      else if("add-subscription" == event.command) {
        this.controller.stageController.pushScene("add", this.api)
        handled = true
      }
      else if(Mojo.Menu.helpCmd == event.command) {
        this.controller.stageController.pushScene("help")
        handled = true
      }
      else if(Mojo.Menu.prefsCmd == event.command) {
        this.controller.stageController.pushScene("preferences")
        handled = true
      }
      else if("debug" == event.command) {
        this.controller.stageController.pushScene("debug")
        handled = true
      }
    }

    if((Mojo.Event.back == event.type || Mojo.Event.forward == event.type) && this.inLandscape() && Preferences.gestureScrolling()) {
      this.landscapeScroll(event.type)
      handled = true
    }

    if(Mojo.Event.back == event.type && this.panelOpen && !this.inLandscape()) {
      this.menuPanelOff()
      handled = true
    }

    if(handled) {
      event.stop()
    }

    return handled
  },

  setTheme: function() {
    var body = this.controller.document.body

    $w(body.className).each(function(className) {
      if(className.startsWith("theme-")) {
        body.removeClassName(className)
      }
    })

    body.addClassName("theme-" + Preferences.getTheme())
  },

  menuPanelOn: function() {
    this.panelOpen = true
    this.getMenuScrim().show()
    this.getMenuPanel().show()
    this.disableSceneScroller()
  },

  menuPanelOff: function() {
    this.panelOpen = false
    this.getMenuPanel().hide()
    this.getMenuScrim().hide()
    this.enableSceneScroller()
  },

  getMenuScrim: function() {
    return this.controller.sceneElement.querySelector("div[x-mojo-menupanel-scrim]")
  },

  getMenuPanel: function() {
    return this.controller.sceneElement.querySelector("div[x-mojo-menupanel]")
  },

  toggleMenuPanel: function() {
    if(this.panelOpen) {
      this.menuPanelOff()
    }
    else {
      this.menuPanelOn()
    }
  },

  disableSceneScroller: function() {
    this.controller.listen(this.controller.sceneElement, Mojo.Event.dragStart, this.dragHandler)
  },

  dragHandler: function(event) {
    event.stop() //prevents the scene from scrolling.
  },

  enableSceneScroller : function() {
    this.controller.stopListening(this.controller.sceneElement, Mojo.Event.dragStart, this.dragHandler)
  },

  searchTextEntry: function(event) {
    if(event.originalEvent && Mojo.Char.enter === event.originalEvent.keyCode) {
      this.search()
    }
  },

  cancelSearch: function(event) {
    this.menuPanelOff()
  },

  startSearch: function(event) {
    if(!this.panelOpen && event.keyCode != 27) {
      event.stop()
      this.menuPanelOn()

      var textEntry = this.controller.get("search-text")
      textEntry.mojo.setValue(String.fromCharCode(event.charCode))
      textEntry.mojo.setCursorPosition(1, 1)
      textEntry.mojo.focus()
    }
  },

  search: function() {
    if(this.searchText.value.strip().length) {
      this.menuPanelOff()
      this.doSearch(this.searchText.value.strip())
    }
    else {
      this.controller.get("search-text").mojo.focus()
    }
  },

  setupSearch: function() {
    this.controller.setupWidget("search-text", {changeOnKeyPress: true, hintText: $L("Search...")}, this.searchText)
    this.controller.setupWidget("search-cancel", {}, {buttonClass: "secondary", buttonLabel: $L("Cancel")})
    this.controller.setupWidget("search-submit", {}, {buttonLabel: $L("Search")})
    this.controller.listen("search-text", Mojo.Event.propertyChange, this.searchTextEntry = this.searchTextEntry.bind(this))
    this.controller.listen("search-cancel", Mojo.Event.tap, this.cancelSearch = this.cancelSearch.bind(this))
    this.controller.listen("search-submit", Mojo.Event.tap, this.search = this.search.bind(this))
  },

  cleanupSearch: function() {
    this.controller.stopListening("search-cancel", Mojo.Event.tap, this.cancelSearch)
    this.controller.stopListening("search-submit", Mojo.Event.tap, this.search)
  },

  listenForSearch: function() {
    $(this.controller.document).observe("keypress", this.startSearch)
    this.controller.get("search-text").mojo.setConsumesEnterKey(false)
  },

  stopListeningForSearch: function() {
    $(this.controller.document).stopObserving("keypress", this.startSearch)
  },

  scrollToTop: function() {
    this.controller.getSceneScroller().mojo.scrollTo(0, 0, true)
  },

  orientationChanged: function(orientation) {
    this.orientation = orientation
  },

  inLandscape: function() {
    return this.orientation == "left" || this.orientation == "right"
  },

  landscapeScroll: function(backOrForward) {
    var scroller = this.controller.getSceneScroller()
    var currentPosition = scroller.mojo.getScrollPosition()
    var scrollerSize = scroller.mojo.scrollerSize()

    var fixedHeader = this.controller.sceneElement.querySelector(".palm-page-header.fixed")
    var headerHeight = fixedHeader ? fixedHeader.getHeight() : 0

    var fixedFooter = this.controller.sceneElement.querySelector("#footer")
    var footerHeight = fixedFooter ? fixedFooter.getHeight() : 0

    var goingDown = (this.orientation == "right" && backOrForward == Mojo.Event.back) || (this.orientation == "left" && backOrForward == Mojo.Event.forward)
    var adjustBy = goingDown ? (-(scrollerSize.height) + headerHeight + footerHeight + 10) : (scrollerSize.height - headerHeight - footerHeight - 10)
    scroller.mojo.scrollTo(0, currentPosition.top + adjustBy, true)
  },

  showOrHideFeeds: function(event) {
    event.stop()
    var items = []

    if(Preferences.hideReadFeeds()) {
      items.push({label: $L("Show read feeds"), command: "show-read-feeds"})
    }
    else {
      items.push({label: $L("Hide read feeds"), command: "hide-read-feeds"})
    }

    this.controller.popupSubmenu({
      placeNear: this.controller.get("header"),
      items: items,

      onChoose: function(command) {
        if(command == "show-read-feeds") {
          Preferences.setHideReadFeeds(false)
        }
        else if(command == "hide-read-feeds") {
          Preferences.setHideReadFeeds(true)
        }

        this.filterAndRefresh()
      }.bind(this)
    })
  },

  showOrHideArticles: function(event) {
    event.stop()
    var items = []

    if(Preferences.hideReadArticles()) {
      items.push({label: $L("Show read articles"), command: "show-read-articles"})
    }
    else {
      items.push({label: $L("Hide read articles"), command: "hide-read-articles"})
    }

    this.controller.popupSubmenu({
      placeNear: this.controller.get("header"),
      items: items,

      onChoose: function(command) {
        if(command == "show-read-articles") {
          Preferences.setHideReadArticles(false)
        }
        else if(command == "hide-read-articles") {
          Preferences.setHideReadArticles(true)
        }

        this.subscription.reset()
        this.findArticles(true)
      }.bind(this)
    })
  }
})
