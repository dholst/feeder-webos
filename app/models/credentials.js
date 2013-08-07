var Credentials = Class.create({
  initialize: function() {
    this.email = this.emailCookie().get()
    this.password = this.passwordCookie().get()
    if(this.serviceCookie().get())
    {
    	this.service = this.serviceCookie().get()
    }
    else
    {
    	this.service = "tor"
    }
  },

  save: function() {
    this.emailCookie().put(this.email)
    this.passwordCookie().put(this.password)
    this.serviceCookie().put(this.service)
  },

  emailCookie: function() {
    return this.getCookie("email")
  },

  passwordCookie: function() {
    return this.getCookie("password")
  },
  
  serviceCookie: function() {
    return this.getCookie("service")
  },

  getCookie: function(name) {
    return new Mojo.Model.Cookie(name)
  }
})
