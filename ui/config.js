var _ = require('lodash')
var EventEmitter = require('events').EventEmitter

module.exports = function(id, init) {
  var container = document.getElementById(id)
  var config = init

  var events = new EventEmitter({
    wildcard: true
  })

  var list = document.createElement('div')
  list.className = 'list'
  container.appendChild(list)

  function create(field) {

    var row = document.createElement('div')
    row.className = 'config-row'
    row.id = 'config-row-' + field
    list.appendChild(row)

    var item = document.createElement('span')
    item.id = 'config-field-' + field
    item.className = 'config-field'
    item.innerHTML = field
    row.appendChild(item)

    var input = document.createElement('input')
    input.id = 'config-input-' + field
    input.value = config[field]
    row.appendChild(input)

    input.addEventListener('input', function (e) {
      config[field] = e.target.value
    })

  }

  function initialize() {
    Object.keys(config).forEach( function(field) {
      create(field)
    })
  }

  function update() {
    Object.keys(config).forEach( function(field) {
      document.getElementById('config-input-' + field).value = config[field]
    })
  }

  initialize()

  return {
    get: function() {
      return config
    },
    load: function(loaded) {
      config = loaded
      update()
    }
  }

}