var BaseAssistant = Class.create({
  initialize: function() {
  },

  setup: function() {
    this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, {})
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
    Log.debug("Crap, bailing..." + message)
  }  
})