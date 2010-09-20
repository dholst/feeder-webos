var StageAssistant = Class.create({
  setup: function() {
    Log.debug("sending metrix data")
    Yafr.Metrix.postDeviceData()

    Log.debug("pushing 'first' scene")
    this.controller.pushScene("first")
  }
})
