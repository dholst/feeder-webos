Preferences = {
  OLDEST_FIRST: "oldest-first",
  HIDE_READ: "hide-read",

  isOldestFirst: function() {
    return this.getCookie(this.OLDEST_FIRST, false)
  },

  setOldestFirst: function(oldestFirst) {
    this.setCookie(this.OLDEST_FIRST, oldestFirst)
  },

  hideRead: function() {
    return this.getCookie(this.HIDE_READ, true)
  },

  setHideRead: function(hideRead) {
    this.setCookie(this.HIDE_READ, hideRead)
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