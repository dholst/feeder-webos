var Credentials = Class.create({
  initialize: function() {
    this.email = this.emailCookie().get()
    this.password = this.passwordCookie().get()
  },

  save: function() {
    this.emailCookie().put(this.email)
    this.passwordCookie().put(this.password)
  },

  emailCookie: function() {
    return this.getCookie("email")
  },

  passwordCookie: function() {
    return this.getCookie("password")
  },

  getCookie: function(name) {
    return new Mojo.Model.Cookie(name)
  }
})
