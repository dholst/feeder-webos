Preferences = {
  OLDEST_FIRST: "oldest-first",

  isOldestFirst: function() {
    return this.getCookie(this.OLDEST_FIRST, false)
  },
  
  setOldestFirst: function(oldestFirst) {
    this.setCookie(this.OLDEST_FIRST, oldestFirst)
  },

  getCookie: function(name, defaultValue) {
    var cookie = this.cookieFor(name)

    if(cookie.get() != undefined) {
      return cookie.get()
    }
    else {
      return defaultValue
    }
  },

  setCookie: function(name, value) {
    this.cookieFor(name).put(value)
  },

  cookieFor: function(name) {
    return new Mojo.Model.Cookie(name)
  }
}