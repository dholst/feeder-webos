Preferences = {
  OLDEST_FIRST: "oldest-first",
  HIDE_READ_FEEDS: "hide-read-feeds",
  HIDE_READ_ARTICLES: "hide-read-articles",
  BACK_AFTER_MARK_AS_READ: "back-after-mark-as-read",
  ALLOW_LANDSCAPE: "allow-landscape",
  FONT_SIZE: "font-size",
  COMBINE_FOLDERS: "combine-folders",
  MANUAL_FEED_SORT: "manual-feed-sort",
  THEME: "theme",
  DEBUG: "debug",

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

  goBackAfterMarkAsRead: function() {
    return this.getCookie(this.BACK_AFTER_MARK_AS_READ, false)
  },

  setBackAfterMarkAsRead: function(backAfterMarkAsRead) {
    this.setCookie(this.BACK_AFTER_MARK_AS_READ, backAfterMarkAsRead)
  },

  allowLandscape: function() {
    return this.getCookie(this.ALLOW_LANDSCAPE, false)
  },

  setAllowLandscape: function(allowLandscape) {
    this.setCookie(this.ALLOW_LANDSCAPE, allowLandscape)
  },

  fontSize: function() {
    return this.getCookie(this.FONT_SIZE, "medium")
  },

  setFontSize: function(fontSize) {
    this.setCookie(this.FONT_SIZE, fontSize)
  },

  combineFolders: function() {
    return this.getCookie(this.COMBINE_FOLDERS, false)
  },

  setCombineFolders: function(combineFolders) {
    this.setCookie(this.COMBINE_FOLDERS, combineFolders)
  },

  isManualFeedSort: function() {
    return this.getCookie(this.MANUAL_FEED_SORT, false)
  },

  setManualFeedSort: function(isManual) {
    this.setCookie(this.MANUAL_FEED_SORT, isManual)
  },

  getTheme: function() {
    return this.getCookie(this.THEME, "grey")
  },

  setTheme: function(theme) {
    this.setCookie(this.THEME, theme)
  },
  
  isDebugging: function() {
    return this.getCookie(this.DEBUG, false)
  },
  
  setDebugging: function(debugging) {
    this.setCookie(this.DEBUG, debugging)
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
    console.log("setting " + name + " to " + value)
    this.cookieFor(name).put(value)
  },

  cookieFor: function(name) {
    return new Mojo.Model.Cookie(name)
  }
}