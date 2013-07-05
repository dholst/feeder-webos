var Log = {
  items: [],

  debug: function(message) {
    Mojo.Log.info(message)

    if(Preferences.isDebugging()) {
      this.items.push({message: message})
    }
  }
}