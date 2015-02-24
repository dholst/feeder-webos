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
  },
    
  activate: function($super, changes) {
    $super(changes)

    this.controller.serviceRequest('palm://com.palm.systemservice/time', {
      method: 'getSystemTime',
      parameters: {},

      onSuccess: function(response) {
        if(((this.credentials.service !== "ttrss" || this.credentials.service !== "oc") && this.credentials.email && this.credentials.password) || ((this.credentials.service === "ttrss" || this.credentials.service === "oc") && this.credentials.email && this.credentials.password && this.credentials.server) || this.credentials.service === "feedly" || this.credentials.service === "aol" ) {
          if(this.triedLogin) {
            Log.debug("ALREADY TRIED LOGGING IN, WHAT MAKES YOU THINK ITS GOING TO WORK NOW")
          }
          else {
            this.triedLogin = true
            Log.debug("logging in as " + this.credentials.email)
            this.spinnerOn($L("logging in..."))
            this.api.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this), this.controller)
          }
        }
        else {
          Log.debug("no credentials found")
          this.controller.stageController.swapScene("credentials", this.credentials)
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
