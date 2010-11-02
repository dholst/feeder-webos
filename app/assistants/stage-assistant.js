var StageAssistant = Class.create({
  setup: function() {
    $(document.body).addClassName("theme-" + Preferences.getTheme())

    Log.debug("sending metrix data")
    Feeder.Metrix.postDeviceData()

    Log.debug("pushing 'login' scene")
    this.controller.pushScene("login")
  }
})
