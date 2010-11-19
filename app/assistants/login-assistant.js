var LoginAssistant = Class.create(BaseAssistant, {
  initialize: function($super, credentials) {
    $super()
    this.hidePreferences = true
    this.credentials = credentials || new Credentials()
    this.api = new Api()
    this.triedLogin = false
    this.hideLogout = true
  },

  setup: function($super) {
    $super()

    Log.debug("sending metrix data")
    Feeder.Metrix.postDeviceData()
  },
    
  activate: function($super, changes) {
    $super(changes)

    this.controller.serviceRequest('palm://com.palm.systemservice/time', {
      method: 'getSystemTime',
      parameters: {},

      onSuccess: function(response) {
        if(Feeder.Metrix.isExpired(response.utc, 14)) {
          this.controller.stageController.pushScene("expired")
        }
        else {
          if(this.credentials.email && this.credentials.password) {
            if(this.triedLogin) {
              Log.debug("ALREADY TRIED LOGGING IN, WHAT MAKES YOU THINK ITS GOING TO WORK NOW")
            }
            else {
              this.triedLogin = true
              Log.debug("logging in as " + this.credentials.email)
              this.spinnerOn($L("logging in..."))
              this.api.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this))
            }
          }
          else {
            Log.debug("no credentials found")
            this.controller.stageController.swapScene("credentials", this.credentials)
          }
        }
      }.bind(this)
    })
  },

  loginSuccess: function() {
    this.credentials.save()
    this.controller.stageController.swapScene("home", this.api)
  },

  loginFailure: function() {
    this.controller.stageController.swapScene("credentials", this.credentials, true)
  }
})
