var Feeder = Feeder || {}

Feeder.Metrix = new Metrix()

Feeder.notify = function(message) {
  Mojo.Controller.getAppController().showBanner({messageText: message}, "", "feeder")
}