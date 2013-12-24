var Credentials = Class.create({
  initialize: function() {
    this.email = this.emailCookie().get()
    this.password = this.passwordCookie().get()
    this.server = this.serverCookie().get()
    if(this.serviceCookie().get())
    {
    	this.service = this.serviceCookie().get()
    }
    else
    {
    	this.service = "tor"
    }
    this.id = this.idCookie().get()
    this.accessToken = this.accessTokenCookie().get()
    this.refreshToken = this.refreshTokenCookie().get()
    this.tokenExpiry = this.tokenExpiryCookie().get()
    this.tokenType = this.tokenTypeCookie().get()
    this.plan = this.planCookie().get()
  },

  save: function() {
    if (this.email !== undefined){
    	this.emailCookie().put(this.email)
    }
    if (this.password !== undefined){
    	this.passwordCookie().put(this.password)
    }
    if (this.server !== undefined){
    	this.serverCookie().put(this.server)
    }    
    if (this.service !== undefined){
    	this.serviceCookie().put(this.service)
    }
    if (this.id !== undefined){
	    this.idCookie().put(this.id)
    }
    if (this.accessToken !== undefined){
	    this.accessTokenCookie().put(this.accessToken)
    }
    if (this.refreshToken !== undefined){    
    	this.refreshTokenCookie().put(this.refreshToken)
    }
    if (this.tokenExpiry !== undefined){
	    this.tokenExpiryCookie().put(this.tokenExpiry)
    }
    if (this.tokenType !== undefined){
    	this.tokenTypeCookie().put(this.tokenType)
    }
    if (this.plan !== undefined){
    	this.planCookie().put(this.plan)
    }
  },
  
  clear: function() {
    this.emailCookie().remove()
    this.passwordCookie().remove()
    this.serverCookie().remove()
    this.serviceCookie().remove()
    this.idCookie().remove()
    this.accessTokenCookie().remove()
    this.refreshTokenCookie().remove()
    this.tokenExpiryCookie().remove()
    this.tokenTypeCookie().remove()
    this.planCookie().remove()
  },

  emailCookie: function() {
    return this.getCookie("email")
  },

  passwordCookie: function() {
    return this.getCookie("password")
  },
  
  serverCookie: function() {
    return this.getCookie("server")
  },

  serviceCookie: function() {
    return this.getCookie("service")
  },
  
  idCookie: function() {
    return this.getCookie("id")
  },
  
  accessTokenCookie: function() {
    return this.getCookie("accessToken")
  },

  refreshTokenCookie: function() {
    return this.getCookie("refreshToken")
  },

  tokenExpiryCookie: function() {
    return this.getCookie("tokenExpiry")
  },

  tokenTypeCookie: function() {
    return this.getCookie("tokenType")
  },

  planCookie: function() {
    return this.getCookie("plan")
  },

  getCookie: function(name) {
    return new Mojo.Model.Cookie(name)
  }
})
