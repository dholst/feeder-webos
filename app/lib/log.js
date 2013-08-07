var Log = {
  items: [],

  debug: function(message) {
    if(Preferences.isDebugging()) {
      Mojo.Log.info(message)
      this.items.push({message: message})
    }
  }
}