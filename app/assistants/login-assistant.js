var LoginAssistant = Class.create(BaseAssistant, { 
  initialize: function($super, credentials) {
    $super()
    this.credentials = credentials || new Credentials()
    this.api = new Api()
    this.triedLogin = false
  },
  
  activate: function($super) {
    $super()
    
    if(this.credentials.email) {      
      if(this.triedLogin) {
        Log.debug("ALREADY TRIED LOGGING IN, WHAT MAKES YOU THINK ITS GOING TO WORK NOW")
      }
      else {
        this.triedLogin = true
        Log.debug("logging in as " + this.credentials.email)
        this.spinnerOn("logging in...")
        this.api.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this))
      }
    }
    else {
      Log.debug("no credentials found")
      this.controller.stageController.swapScene("credentials", this.credentials)
    }
  },
  
  loginSuccess: function() {
    this.credentials.save()
    this.controller.stageController.swapScene("main", this.api)
  },

  loginFailure: function() {
    this.controller.stageController.swapScene("credentials", this.credentials, true)
  }  
})