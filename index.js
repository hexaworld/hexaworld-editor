var _ = require('lodash')
var interact = require('interact.js')
var transform = require('hexaworld/transform.js')
var tile = require('hexaworld/geo/tile.js')
var Mask = require('hexaworld/mask.js')
var World = require('hexaworld/world.js')
var Camera = require('hexaworld/camera.js')
var Game = require('crtrdg-gameloop')
var Keyboard = require('crtrdg-keyboard')

var editor = document.getElementById('editor')

var game = new Game({
  canvas: 'game',
  width: editor.clientWidth,
  height: editor.clientHeight
})

var pathset = [
  [], 
  [0], 
  [0,1,2,3,4,5],
  [0,1], [0, 2], [0, 3],
  [0,1,2], [0,2,4], [0,1,3], [0,1,4],
  [0,1,2,3], [0,1,2,4], [0,1,2,3,4]
]

var pathgroups = [2, 5, 9]

var tileset = pathset.map( function(paths) {
  return tile({
    position: [0, 0],
    scale: 60,
    paths: paths,
    thickness: 1
  })
})

var mask = new Mask({
  size: 1 * 100/2,
  position: [100/2, 100/2],
  fill: 'rgb(90,90,90)',
  orientation: 'flat'
})

function makeIcons() {
  tileset.forEach( function (tile, i) {
    var canvas = document.createElement('canvas')
    canvas.setAttribute('width', '100px')
    canvas.setAttribute('height', '100px')
    canvas.id = i
    canvas.className = 'tile-icon icon'
    document.getElementById('tileset').appendChild(canvas)
    if (pathgroups.indexOf(i) > -1) {
      document.getElementById('tileset').appendChild(document.createElement('hr'))
    }
  })
}

function drawIcons() {
  tileset.forEach( function (tile, i) {
    var context = document.getElementById(i).getContext('2d')
    var camera = {transform: transform(), game: {width: 100, height: 100}}
    mask.set(context)
    tile.draw(context, camera)
    mask.unset(context)
  })
}

makeIcons()
drawIcons()

function getposition(event) {
  var x = event.pageX - game.width/2
  var y = event.pageY - game.width/2
  if (_.all([x > -game.width/2, x < game.width/2, y > -game.height/2, y < game.height/2])) {
    return camera.transform.apply([[x, y]])[0]
  }
}

_.forEach(document.getElementsByClassName('tile-icon'), function(icon) {
  icon.addEventListener('click', function (item) {
    var id = icon.id
    pathset[id] = _.map(pathset[id], function(i) {return (i + 1 > 5) ? 0 : (i + 1)})
    tileset[id] = tile({
      position: [0, 0], 
      scale: 60, 
      paths: pathset[id],
      thickness: 1
    })
    drawIcons()
  })
})

interact('.tile-icon').draggable({

  onmove: function (event) {
    var target = event.target
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
    var translation = 'translate(' + x + 'px, ' + y + 'px)'
    target.style.webkitTransform = target.style.transform = translation
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
    world.tiles.forEach( function(tile) {
      tile.props.stroke = null
    })
    var position = getposition(event)
    if (position) {
      var location = world.locate(position)
      if (location > -1) {
        world.tiles[location].props.stroke = 'white'
        world.tiles[location].props.thickness = 10
      }
      world.tiles = _.sortBy(world.tiles, function (tile, i) {
        return location == i
      })
    }
  },

  onend: function (event) {
    var target = event.target
    var position = getposition(event)
    if (position) {
      var location = world.locate(position)
      if (location > -1) world.tiles.splice(location, 1)
      var q = Math.round(position[0] * 2/3 / 50)
      var r = Math.round((-position[0] / 3 + Math.sqrt(3)/3 * position[1]) / 50)
      var t = tile({
        position: [q, r],
        scale: 50,
        paths: pathset[target.id],
        thickness: 0.75
      })
      world.tiles.push(t)
    }
    target.style.webkitTransform = target.style.transform = 'translate(0px, 0px)'
    target.setAttribute('data-x', 0)
    target.setAttribute('data-y', 0)
  }
})


var camera = new Camera({
  scale: 0.7,
  speed: {position: .5, angle: .1, scale: .002},
  friction: 0.9,
})

var keyboard = new Keyboard(game)
var world = new World()
var init = [
  [0, 0], [-1, 1], [-1, 0], [0, -1],
  [1, 0], [0, 1], [1, -1]
]
world.tiles = init.map(function (p) {
  return tile({
    position: p, 
    scale: 50,
    thickness: 0.75
  })
})

camera.addTo(game)
world.addTo(game)

camera.on('update', function(interval) {
  this.move(keyboard)
})

game.on('draw', function(context) {
  world.draw(context, camera)
})