var BaseAssistant = Class.create({
  initialize: function() {
    this.smallSpinner = {spinning: false}
  },

  setup: function() {
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

  readytoactivat: function() {
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
    if(Mojo.Event.command === event.type) {
      if("logout" == event.command) {
        this.controller.stageController.popScenesTo("main", "logout")
      }
      else if("add-subscription" == event.command) {
        this.controller.stageController.pushScene("add", this.api)
        event.stop()
      }
      else if(Mojo.Menu.helpCmd == event.command) {
        this.controller.stageController.pushScene("help")
        event.stop()
      }
      else if(Mojo.Menu.prefsCmd == event.command) {
        this.controller.stageController.pushScene("preferences")
        event.stop()
      }
      else if("debug" == event.command) {
        this.controller.stageController.pushScene("debug")
        event.stop()
      }
    }
  }
})