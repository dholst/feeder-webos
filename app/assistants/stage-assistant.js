var StageAssistant = Class.create({
  setup: function() {
    Log.debug("sending metrix data")
    Yafr.Metrix.postDeviceData()

    Log.debug("pushing 'login' scene")
    this.controller.pushScene("login")
  }
})
