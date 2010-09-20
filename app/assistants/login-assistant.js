var LoginAssistant = Class.create(BaseAssistant, { 
  initialize: function($super, credentials) {
    $super()
    this.credentials = credentials || new Credentials()
    this.google = new Google()
  },
  
  activate: function($super) {
    $super()
    
    if(this.credentials.email) {
      Log.debug("logging in as " + this.credentials.email)
      this.spinnerOn("logging in...")
      this.google.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this))
    }
    else {
      Log.debug("no credentials found")
      this.controller.stageController.swapScene("credentials", this.credentials)
    }
  },
  
  loginSuccess: function() {
    try {
      this.credentials.save()
      this.controller.stageController.swapScene("feeds", this.google)
    }
    catch(e) {
      console.log("WTF?")
    }
  },

  loginFailure: function() {
    try {
      this.controller.stageController.swapScene("credentials", this.credentials, true)
    }
    catch(e) {
      console.log("WTF?")
    }
  }  
})