var popup = require('popupjs')
var _ = require('lodash')

module.exports = function (payload) {
  var save = popup({
    id: 'popup',
    content: '<h2>save your world</h2><input id="world-name" value="world" type="text" class="text-input" autofocus>',
    buttons: [
      {
        text: 'save world',
        className: 'save-world',
        fn: function () {
          var input = document.getElementById('world-name')
          var el = document.getElementById('button-save-download')
          el.setAttribute('download', input.value + '.json')
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
