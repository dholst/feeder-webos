var Instapaper = {
  send: function(url, title, success, badCredentials, failure) {
    var username = Preferences.getInstapaperUsername()
    var password = Preferences.getInstapaperPassword()

    if(username) {
      new Ajax.Request("https://www.instapaper.com/api/add", {
        method: "get",
        parameters: {username: username, password: password, url: url, title: title},
        onSuccess: success,
        on403: badCredentials,
        onFailure: failure
      })
    }
    else {
      badCredentials()
    }
  }
}
