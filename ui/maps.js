var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var base = require('../base.js')

module.exports = function(id, maps) {
  var container = document.getElementById(id)

  var events = new EventEmitter({
    wildcard: true
  })

  var selected = 0

  var list = document.createElement('div')
  list.className = 'list'
  container.appendChild(list)

  function additem(num) {

    var row = document.createElement('div')
    row.className = 'button-row'
    row.id = 'list-row-' + num
    list.appendChild(row)

    var item = document.createElement('span')
    item.id = 'list-item-' + num
    item.dataset.id = num
    item.className = 'button button-item'
    item.innerHTML = 'map ' + num
    row.appendChild(item)

    item.onclick = function (event) {
      selected = item.dataset.id
      updateSelected()
      events.emit('selected', item.dataset.id)
    }

    var minus = document.createElement('span')
    minus.id = 'list-minus-' + num
    minus.dataset.id = num
    minus.className = 'button button-minus'
    minus.innerHTML = '-'
    row.appendChild(minus)

    minus.onclick = function (event) {
      if (maps.length > 1) {
        maps.splice(minus.dataset.id, 1)
        if (selected > maps.length - 1) selected = maps.length - 1
        events.emit('selected', selected)
        update()
      }
    }
  }

  var plus = document.createElement('span')
  plus.id = 'list-plus'
  plus.innerHTML = '+'
  plus.className = 'button button-plus'
  container.appendChild(plus)

  plus.onclick = function (event) {
    maps.push(_.cloneDeep(maps[selected]))
    update()
  }

  function update() {
      var items = document.getElementsByClassName('button-row')
      _.range(items.length).forEach( function(i) {
        document.getElementById('list-row-' + i).remove()
      })
      maps.forEach(function (map, i) {
          additem(i)
      })
      updateSelected()
  }

  function updateSelected() {
    var items = document.getElementsByClassName('button button-item')
    _.range(items.length).forEach( function (i) {
      document.getElementById('list-item-' + i).classList.remove('button-active')
    })
    console.log(selected)
    document.getElementById('list-item-' + selected).classList.add('button-active')
  }

  update()

  return {
    getall: function() {
        return maps
    },
    get: function(i) {
      return maps[i]
    },
    reset: function(i) {
      maps[i] = base()
    },
    load: function(loaded) {
      maps = loaded
      update()
    },
    events: events
  }
}