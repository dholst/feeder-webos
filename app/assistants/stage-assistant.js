var StageAssistant = Class.create({
  setup: function() {
    Log.debug("sending metrix data")
    Feeder.Metrix.postDeviceData()

    Log.debug("pushing 'login' scene")
    this.controller.pushScene("login")
  }
})
