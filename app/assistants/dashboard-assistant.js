var DashboardAssistant = Class.create({
  initialize: function(count) {
    this.count = count
  },

  setup: function() {
    this.controller.update("dashboard-title", $L("New Articles"))
    this.controller.update("dashboard-text", $L("You have new articles to read"))
    this.controller.update("unread-count", this.count)
  },

  updateDashboard: function(count) {
    this.controller.update("unread-count", count)                     
  }
})

