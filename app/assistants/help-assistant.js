HelpAssistant = Class.create(BaseAssistant, {
  initialize: function($super) {
    $super()
    this.hideAppMenu = true
  },

  setup: function($super) {
    $super()
    this.controller.update('app-name', Mojo.appInfo.title)
  	this.controller.update('app-details', Mojo.appInfo.version + $L(" by") + " " + Mojo.appInfo.vendor)
  }
})
