var BaseAssistant = Class.create({
  initialize: function() {
    this.smallSpinner = {spinning: false}
  },

  setup: function() {
    var appMenuItems = []
    appMenuItems.push(Mojo.Menu.editItem)

    if(!this.hideAppMenu) {
      if(!this.hidePreferences) {
        appMenuItems.push({label: $L("Preferences"), command: Mojo.Menu.prefsCmd})
      }

      if(!this.hideLogout) {
        appMenuItems.push({label: $L("Logout"), command: "logout"})
      }

      appMenuItems.push({label: $L("Help"), command: Mojo.Menu.helpCmd})
    }

    this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {visible: true, items: appMenuItems})
    this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, {})
    this.controller.setupWidget("small-spinner", {spinnerSize: "small"}, this.smallSpinner)
  },

  ready: function() {
  },

  readytoactivat: function() {
  },

  activate: function() {
    this.controller.stageController.setWindowOrientation(Preferences.allowLandscape() ? "free" : "up")
  },

  deactivate: function() {

  },

  cleanup: function() {
  },

  smallSpinnerOn: function() {
    this.hideRefreshButton()
    this.smallSpinner.spinning = true
    this.controller.modelChanged(this.smallSpinner)
  },

  smallSpinnerOff: function() {
    this.smallSpinner.spinning = false
    this.controller.modelChanged(this.smallSpinner)
    this.showRefreshButton()
  },

  hideRefreshButton: function() {
    var button = this.controller.sceneElement.querySelector(".my-right-icon")
    if(button) button.hide()
  },

  showRefreshButton: function() {
    var button = this.controller.sceneElement.querySelector(".my-right-icon")
    if(button) button.show()
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

  bail: function(message) {
    this.controller.stageController.pushScene("bail")
  },

  sourceRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
  },

  refreshList: function(list, items) {
    list.mojo.noticeUpdatedItems(0, items)
    list.mojo.setLength(items.length)
  },

  handleCommand: function(event) {
    if(Mojo.Event.command === event.type) {
      if("logout" == event.command) {
        this.controller.stageController.popScenesTo("main", "logout")
      }
      else if(Mojo.Menu.helpCmd == event.command) {
        this.controller.stageController.pushScene("help")
        event.stop()
      }
      else if(Mojo.Menu.prefsCmd == event.command) {
        this.controller.stageController.pushScene("preferences")
        event.stop()
      }

    }
  },

  filterReadItems: function(list, itemsProperty) {
    itemsProperty = itemsProperty || "items"

    if(Preferences.hideReadFeeds()) {
      list["original" + itemsProperty] = []
      list["original" + itemsProperty].push.apply(list["original" + itemsProperty], list[itemsProperty])

      var filtered = $A(list[itemsProperty]).select(function(item){return item.sticky || item.unreadCount})
      list[itemsProperty].clear()
      list[itemsProperty].push.apply(list[itemsProperty], filtered)
    }
    else if(list["original" + itemsProperty]) {
      list[itemsProperty].clear()
      list[itemsProperty].push.apply(list[itemsProperty], list["original" + itemsProperty])
      list["original" + itemsProperty] = null
    }
  }
})