var DashboardAssistant = Class.create({
  initialize: function(count) {
    this.count = count
  },

  setup: function() {
    this.controller.update("dashboard-title", $L("New Articles"))
    this.controller.update("dashboard-text", $L("You have new articles to read"))
    this.controller.update("unread-count", this.count)
    this.controller.listen("dashboard-info", Mojo.Event.tap, this.launchApp = this.launchApp.bind(this))
  },

  cleanup: function() {
    this.controller.stopListening("dashboard-info", Mojo.Event.tap, this.launchApp)
  },

  launchApp: function() {
    Mojo.Controller.getAppController().assistant.handleLaunch()
    this.controller.window.close()  
  },
    
  updateDashboard: function(count) {
    this.controller.update("unread-count", count)                     
  }
})

