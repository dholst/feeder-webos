var Feeder = Feeder || {}

Feeder.notify = function(message) {
  Mojo.Controller.getAppController().showBanner({messageText: message}, "", "feeder")
}

Feeder.Event = {
  refreshWanted: "feeder-refresh",
  refreshComplete: "feeder-refresh-complete"
}
