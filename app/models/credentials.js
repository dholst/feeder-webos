var Credentials = Class.create({
  initialize: function() {
    this.email = this.emailCookie().get() || 'yafrapp'
    this.password = this.passwordCookie().get() || 'Password1!'
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