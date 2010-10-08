var BaseAssistant = Class.create({
  initialize: function() {
    this.smallSpinner = {spinning: false}
  },

  setup: function() {
    var appMenuItems = []
    appMenuItems.push(Mojo.Menu.editItem)

    if(!this.hideAppMenu) {
      if(!this.hidePreferences) {
        appMenuItems.push({label: "Preferences", command: Mojo.Menu.prefsCmd})
      }

      if(!this.hideLogout) {
        appMenuItems.push({label: "Logout", command: "logout"})
      }

      appMenuItems.push({label: "Help", command: Mojo.Menu.helpCmd})
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

  filterReadItems: function(list) {
    if(Preferences.hideRead()) {
      list.originalItems = []
      list.originalItems.push.apply(list.originalItems, list.items)

      var filtered = $A(list.items).select(function(item){return item.sticky || item.unreadCount})
      list.items.clear()
      list.items.push.apply(list.items, filtered)
    }
    else if(list.originalItems) {
      list.items.clear()
      list.items.push.apply(list.items, list.originalItems)
      list.originalItems = null
    }
  }
})