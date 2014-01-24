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
  MARK_READ_SCROLL: "mark-read-scroll",
  NOTIFICATIONS_INTERVAL: "notifications-interval",
  NOTIFICATIONS_FEEDS: "m-notifications-feeds",
  ANY_OR_SELECTED_FEEDS: "n-any-or-selected-feeds",
  GESTURE_SCROLLING: "o-gesture-scrolling",
  SHARING_SORT_ORDER: "p-sharing-sort-order",
  INSTAPAPER_USERNAME: "q-instapaper-username",
  INSTAPAPER_PASSWORD: "r-instapaper-password",
  LEFTY_FRIENDLY: "s-lefty-friendly",
  FEEDLY_SORT_ENGAGEMENT: "feedly-sort-engagement",

  isFeedlySortEngagement: function() {
    return this.getCookie(this.FEEDLY_SORT_ENGAGEMENT, false)
  },

  setFeedlySortEngagement: function(isFeedlySortEngagement) {
    this.setCookie(this.FEEDLY_SORT_ENGAGEMENT, isFeedlySortEngagement)
  },

  isLeftyFriendly: function() {
    return this.getCookie(this.LEFTY_FRIENDLY, false)
  },

  setLeftyFriendly: function(isLeftyFriendly) {
    this.setCookie(this.LEFTY_FRIENDLY, isLeftyFriendly)
  },

  getInstapaperUsername: function() {
    return this.getCookie(this.INSTAPAPER_USERNAME, null)
  },

  setInstapaperUsername: function(username) {
    this.setCookie(this.INSTAPAPER_USERNAME, username)
  },

  getInstapaperPassword: function() {
    return this.getCookie(this.INSTAPAPER_PASSWORD, null)
  },

  setInstapaperPassword: function(password) {
    this.setCookie(this.INSTAPAPER_PASSWORD, password)
  },

  getSharingOptionsSortOrder: function() {
    return this.getCookie(this.SHARING_SORT_ORDER, [])
  },

  setSharingOptionsSortOrder: function(sortOrder) {
    this.setCookie(this.SHARING_SORT_ORDER, sortOrder)
  },

  isSharingOptionEnabled: function(option, defaultValue) {
    return this.getCookie(option, defaultValue)
  },

  setSharingOptionEnabled: function(option, value) {
    this.setCookie(option, value)
  },

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

  gestureScrolling: function() {
    return this.getCookie(this.GESTURE_SCROLLING, true)
  },

  setGestureScrolling: function(gestureScrolling) {
    this.setCookie(this.GESTURE_SCROLLING, gestureScrolling)
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

  markReadAsScroll: function() {
    return this.getCookie(this.MARK_READ_SCROLL, false)
  },

  setMarkReadAsScroll: function(markRead) {
    this.setCookie(this.MARK_READ_SCROLL, markRead)
  },

  notificationInterval: function() {
    return this.getCookie(this.NOTIFICATIONS_INTERVAL, "00:00:00")
  },

  setNotificationInterval: function(interval) {
    this.setCookie(this.NOTIFICATIONS_INTERVAL, interval)
  },

  getWatchedFeeds: function() {
    return this.getCookie(this.NOTIFICATIONS_FEEDS, [])
  },

  setWatchedFeeds: function(feeds) {
    this.setCookie(this.NOTIFICATIONS_FEEDS, feeds)
  },

  anyOrSelectedFeedsForNotifications: function() {
    return this.getCookie(this.ANY_OR_SELECTED_FEEDS, "any")
  },

  setAnyOrSelectedFeedsForNotification: function(value) {
    this.setCookie(this.ANY_OR_SELECTED_FEEDS, value)
  },

  wantsNotificationFor: function(id) {
    if(this.anyOrSelectedFeedsForNotifications() == "any") {
      return id.startsWith("feed/")
    }
    else {
      return this.getWatchedFeeds().any(function(n) {return n == id})
    }
  },

  addNotificationFeed: function(feed) {
    var feeds = this.getWatchedFeeds()
    feeds.push(feed)
    this.setWatchedFeeds(feeds)
  },

  removeNotificationFeed: function(feed) {
    var feeds = this.getWatchedFeeds()
    feeds = feeds.reject(function(n) {return n == feed})
    this.setWatchedFeeds(feeds)
  },

  getCookie: function(name, defaultValue) {
    var cookie = this.cookieFor(name)

    if (cookie.get() != undefined) {
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

