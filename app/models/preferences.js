Preferences = {
  OLDEST_FIRST: "oldest-first",
  HIDE_READ_FEEDS: "hide-read",
  HIDE_READ_ARTICLES: "hide-read-articles",

  isOldestFirst: function() {
    return this.getCookie(this.OLDEST_FIRST, false)
  },

  setOldestFirst: function(oldestFirst) {
    this.setCookie(this.OLDEST_FIRST, oldestFirst)
  },

  hideReadFeeds: function() {
    return this.getCookie(this.HIDE_READ_FEEDS, true)
  },

  setHideReadFeeds: function(hideReadFeeds) {
    this.setCookie(this.HIDE_READ_FEEDS, hideReadFeeds)
  },

  hideReadArticles: function() {
    return this.getCookie(this.HIDE_READ_ARTICLES, true)
  },

  setHideReadArticles: function(hideReadArticles) {
    this.setCookie(this.HIDE_READ_ARTICLES, hideReadArticles)
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