var popup = require('popupjs')

module.exports = function (payload) {
  var save = popup({
    id: 'popup',
    content: '<h2>save your world</h2><input id="world-name" value="world.json" type="text" class="text-input" autofocus>',
    buttons: [
      {
        text: 'save world',
        className: 'save-world',
        fn: function () {
          var input = document.getElementById('world-name')
          var world = input.value
          if (world.substr(world.length - 5) !== '.json') {
            world = world + '.json'
          }
          var el = document.getElementById('button-save-download')
          el.setAttribute('download', world)
          el.setAttribute('href', 'data:application/text,' + payload)
          el.click()
          save.remove()
        }
      },
      {
        text: 'cancel',
        className: 'cancel',
        fn: function () {
          save.remove()
        }
      }
    ]
  })

  return save
}
