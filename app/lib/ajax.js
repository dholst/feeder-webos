Ajax.Responders.register({
  onCreate: function(request) {
  	Log.debug("ajax request started, " + request.method + " " + request.url)
  },

  onComplete: function(request) {
    Log.debug("ajax request completed with status code " + request.getStatus())
  },

  onException: function(request, exception) {
    Log.debug("ajax exception - " + exception.message)
  }
})

Ajax.Request.prototype.success = function() {
  var status = this.getStatus()
  return (status >= 200 && status < 300)
}