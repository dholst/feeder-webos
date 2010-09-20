Ajax.Responders.register({
  onCreate: function(request) {
  	Mojo.Log.info("ajax request started,", request.method, request.url)
  },

  onComplete: function(request) {
    Mojo.Log.info("ajax request completed with status code", request.getStatus())
  },

  onException: function(request, exception) {
    Mojo.Log.info("ajax exception -", exception.message)
  }
})

Ajax.Request.prototype.success = function() {
  var status = this.getStatus()
  return (status >= 200 && status < 300)
}