var core = require('hexaworld/game.js')
var hexaworld = require('hexaworld/play.js')
var base = require('./base.js')
var editor = require('./ui/editor.js')
var maps = require('./ui/maps.js')
var config = require('./ui/config.js')

var editorContainer = document.getElementById('editor-container')
var selectorContainer = document.getElementById('selector')
var width = editorContainer.clientWidth
var height = editorContainer.clientHeight
var offset = selectorContainer.clientWidth

var selected = 0
var init = [base()]
var maps = maps('maps', init)

var init = {name: 'welcome', lives: 3, moves: 6, difficulty: 1}
var config = config('config', init)

var edit = editor('editor', maps.get(selected), {width: width, height: height, offset: offset})
var game = core('game-container', maps.get(selected))
var play = hexaworld('play-container', {config: config.get(), maps: maps.getall()})

document.getElementById('play-container').style.display = 'none'
document.getElementById('game-container').style.display = 'none'

maps.events.on('selected', function(id) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  document.getElementById('play-container').style.display = 'none'
  game.pause()
  play.pause()
  editorContainer.style.background = 'rgb(100,100,100)'
  selected = id
  edit.reload(maps.get(selected))
})

document.getElementById('button-edit').onclick = function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  document.getElementById('play-container').style.display = 'none'
  editorContainer.style.background = 'rgb(100,100,100)'
  game.pause()
  play.pause()
  edit.resume()
}

document.getElementById('button-game').onclick = function (event) {
  game.reload(maps.get(selected))
  game.resume()
  play.pause()
  edit.pause()
  setTimeout(function() {
    editorContainer.style.background = 'rgb(55,55,55)'
    document.getElementById('editor').style.display = 'none'
    document.getElementById('play-container').style.display = 'none' 
    document.getElementById('game-container').style.display = 'block' 
  }, 50)
}

document.getElementById('button-play').onclick = function (event) {
  var level = {config: config.get(), maps: maps.getall()}
  play.reload(level)
  play.start()
  game.pause()
  edit.pause()
  setTimeout(function() {
    editorContainer.style.background = 'rgb(55,55,55)'
    document.getElementById('editor').style.display = 'none'
    document.getElementById('game-container').style.display = 'none' 
    document.getElementById('play-container').style.display = 'block' 
  }, 50)
}

document.getElementById('button-reset').onclick = function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  document.getElementById('play-container').style.display = 'none'
  editorContainer.style.background = 'rgb(100,100,100)'
  game.pause()
  maps.reset(selected)
  edit.reload(maps.get(selected))
  edit.resume()
}

document.getElementById('button-save').onclick = function (event) {
  var level = {config: config.get(), maps: maps.getall()}
  var payload = encodeURIComponent(JSON.stringify(level))
  var el = document.getElementById('button-save-download')
  el.setAttribute('download', level.config.name + '.json')
  el.setAttribute('href', 'data:application/text,' + payload)
  el.click()
}

document.getElementById('button-load-label').onclick = function (event) {
  document.getElementById('button-load').value = null
}

document.getElementById('button-load').onchange = function (event) {
  var reader = new FileReader()
  reader.onload = function (event) {
    var schema = JSON.parse(event.target.result)
    selected = 0
    config.load(schema.config)
    maps.load(schema.maps)
    edit.reload(maps.get(selected))
  }
  reader.readAsText(this.files[0])
}