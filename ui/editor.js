var _ = require('lodash')
var interact = require('interact.js')
var transform = require('transformist')
var tile = require('hexaworld/geometry/tile.js')
var circle = require('hexaworld/geometry/circle.js')
var hex = require('hexaworld/geometry/hex.js')
var mouse = require('hexaworld/geometry/mouse.js')
var Mask = require('hexaworld/util/mask.js')
var World = require('hexaworld/entity/world.js')
var Player = require('hexaworld/entity/player.js')
var Camera = require('hexaworld/entity/camera.js')
var Keyboard = require('crtrdg-keyboard')

module.exports = function(canvas, schema, opts) {
  var editor = document.getElementById(canvas)
  editor.setAttribute('width', opts.width + 'px')
  editor.setAttribute('height', opts.height + 'px')

  var paths = [
    [], [3], [3,0], [3,5], [3,4],
    [1,3,5], [3,4,5], [3,4,0], [3,4,1],
    [0,1,2,3], [0,1,2,4], [0,1,3,4],
    [0,1,2,3,4], [0,1,2,3,4,5],
  ]

  var cues = [
    '#FF5050', 
    '#FF8900', 
    '#00C3EE', 
    '#64FF00'
  ]

  var targets = [
    'white', 
  ]

  var groups = [4, 8]
  var size = opts.width / 10.5

  var icons = {
    tile: paths.map( function (p) {
      return tile({
        translation: [0, 0],
        scale: size / 2,
        paths: p,
        thickness: 1
      })
    }),

    landmark: cues.map( function (c) {
      return hex({
        fill: c,
        stroke: c, 
        scale: size / 5,
        thickness: 3
      })
    }),

    blank: [circle({fill: 'rgb(90,90,90)', stroke: 'rgb(90,90,90)'})],

    player: [mouse({fill: 'rgb(75,75,75)', stroke: 'white', thickness: 3, scale: size/9})],

    goal: targets.map( function (c) {
      return circle({
        fill: c,
        stroke: 'white', 
        thickness: 3, 
        scale: size / 8
      })
    }),
  }

  var mask = new Mask({
    size: 0.95 * size/2,
    translation: [size/2, size/2],
    fill: 'rgb(90,90,90)',
    orientation: 'flat'
  })

  function makeIcon(i, label, group) {
    var canvas = document.createElement('canvas')
    canvas.setAttribute('width', size + 'px')
    canvas.setAttribute('height', size + 'px')
    canvas.id = label + '-' + i
    canvas.className = label + '-icon icon'
    document.getElementById(group).appendChild(canvas)
  }

  function drawIcon(i, label) {
    var context = document.getElementById(label + '-' + i).getContext('2d')
    var camera = {transform: transform(), game: {width: size, height: size}}
    mask.set(context)
    icons[label][i].draw(context, camera, {order: 'bottom'})
    mask.unset(context)
  }

  _.forEach(_.range(icons.tile.length), function(i) {
    makeIcon(i, 'tile', 'tile')
    drawIcon(i, 'tile')
    if (groups.indexOf(i) > -1) {
      document.getElementById('tile').appendChild(document.createElement('hr'))
    }
  })

  _.forEach(_.range(icons.landmark.length), function(i) {
    makeIcon(i, 'landmark', 'item')
    drawIcon(i, 'landmark')
  })

  document.getElementById('item').appendChild(document.createElement('hr'))

  _.forEach(_.range(icons.blank.length), function(i) {
    makeIcon(i, 'blank', 'item')
    drawIcon(i, 'blank')
  })

  _.forEach(_.range(icons.player.length), function(i) {
    makeIcon(i, 'player', 'item')
    drawIcon(i, 'player')
  })

  _.forEach(_.range(icons.goal.length), function(i) {
     makeIcon(i, 'goal', 'item')
     drawIcon(i, 'goal')
  })

  function getPosition(event) {
    var x = event.pageX - editor.width/2 - opts.offset
    var y = event.pageY - editor.height/2
    if (_.all([x > -editor.width/2, x < editor.width/2, y > -editor.height/2, y < editor.height/2])) {
      return camera.transform.apply([[x, y]])[0]
    }
  }

  _.forEach(document.getElementsByClassName('tile-icon'), function(icon) {
    icon.addEventListener('click', function (item) {
      var d
      if (item.offsetY > 0 && item.offsetY < size) {
        if (item.offsetX >= size/2 && item.offsetX < size) d = 1
        if (item.offsetX > 0 && item.offsetX < size/2) d = -1
      } 
      if (d) {
        var id = parseInt(icon.id.split('-')[1])
        paths[id] = _.map(paths[id], function(i) {return ((i + d) % 6) < 0 ? 5 : ((i + d) % 6) })
        icons.tile[id] = tile({
          translation: [0, 0], 
          scale: size/2, 
          paths: paths[id],
          thickness: 1
        })
        drawIcon(id, 'tile')
      }
    })
  })

  _.forEach(document.getElementsByClassName('landmark-icon'), function(icon) {
    icon.addEventListener('click', function (item) {
      var d
      var f = 1.6
      if (item.offsetY > 0 && item.offsetY < size) {
        if (item.offsetX >= size/2 && item.offsetX < size) d = f
        if (item.offsetX > 0 && item.offsetX < size/2) d = 1 / f
      } 
      if (d) {
        var id = parseInt(icon.id.split('-')[1])
        if (d > 1 & icons.landmark[id].transform.scale >= (size / 5) * f) return
        if (d < 1 & icons.landmark[id].transform.scale <= (size / 5) * (1 / f)) return
        icons.landmark[id].update({scale: d})
        drawIcon(id, 'landmark')
      }
    })
  })

  _.forEach(document.getElementsByClassName('player-icon'), function(icon) {
    icon.addEventListener('click', function (item) {
      var d
      if (item.offsetY > 0 && item.offsetY < size) {
        if (item.offsetX >= size/2 && item.offsetX < size) d = 1
        if (item.offsetX > 0 && item.offsetX < size/2) d = -1
      } 
      if (d) {
        var id = parseInt(icon.id.split('-')[1])
        icons.player[id].update({rotation: 60 * d})
        drawIcon(id, 'player')
      }
    })
  })

  interact('.icon').draggable({

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
      var position = getPosition(event)
      if (position) {
        var location = world.locate(position)
        if (location > -1) {
          world.tiles[location].props.stroke = 'rgb(100, 200, 112)'
          world.tiles[location].props.thickness = 10
        }
        world.tiles = _.sortBy(world.tiles, function (tile, i) {
          return location == i
        })
      }
      drawEditor()
    },

    onend: function (event) {
      var target = event.target
      var position = getPosition(event)
      if (position) {
        var q = Math.round(position[0] * 2 / 3 / 50)
        var r = Math.round((-position[0] / 3 + Math.sqrt(3)/3 * position[1]) / 50)
        var location = _.findIndex(schema.tiles, function(item) {
          return item.translation[0] === q && item.translation[1] === r 
        })

        if (target.className.split(' ')[0] == 'tile-icon') {    
          var id = parseInt(target.id.split('-')[1])
          if (location > -1) {
            schema.tiles[location].paths = paths[id]
          } else {
            schema.tiles.push({translation: [q, r], paths: paths[id]})
          }
          rebuildGame()
        }

        if (target.className.split(' ')[0] == 'landmark-icon') {
          var id = parseInt(target.id.split('-')[1])
          if (location > -1) {
            var f = 1.6
            var scale = 2
            if (icons.landmark[id].transform.scale >= (size / 5) * f) scale = 3
            if (icons.landmark[id].transform.scale <= (size / 5) * (1 / f)) scale = 1
            console.log(scale)
          console.log(icons.landmark[id].transform.scale)
          console.log((size / 5) * 1 / f)
            schema.tiles[location].cue = {fill: cues[id], scale: scale}
          }
          rebuildGame()
        }

        if (target.className.split(' ')[0] === 'blank-icon') {
          if (location > -1) {
            delete schema.tiles[location].cue
            delete schema.tiles[location].target
            if (schema.start.length > 1) {
              _.remove(schema.start, function (start) {
                return _.isEqual(start.translation, [q, r])
              })
            }
          }
          rebuildGame()
        }
      
        if (target.className.split(' ')[0] === 'player-icon') {
          if (location > -1) {
            _.remove(schema.start, function (start) {
              return _.isEqual(start.translation, [q, r])
            })
            schema.start.push({
              translation: [q, r],
              rotation: icons.player[0].transform.rotation
            })
          }
          rebuildGame()
        }

        if (target.className.split(' ')[0] == 'goal-icon') {
          var id = parseInt(target.id.split('-')[1])
          if (location > -1) {
            schema.tiles[location].target = {fill: targets[id]}
            schema.target = [q, r]
          }
          rebuildGame()
        }

      }
      target.style.webkitTransform = target.style.transform = 'translate(0px, 0px)'
      target.setAttribute('data-x', 0)
      target.setAttribute('data-y', 0)
      drawEditor()
    }
  })

  var keyboard = new Keyboard()
  var camera = new Camera({
    scale: 0.75,
    speed: {translation: .5, rotation: .1, scale: .002},
    friction: 1,
  })
  camera.game = {width: editor.width, height: editor.height}

  var world = new World(schema.tiles, {thickness: 0.75})

  var player = new Player({
    scale: 2,
    translation: [0, 0],
    rotation: 0,
    character: 'mouse',
    speed: {translation: 1, rotation: 8},
    friction: 0.9,
    stroke: 'white',
    fill: 'rgb(75,75,75)',
    thickness: 0.5
  })

  var paused = false

  keyboard.on('keydown', function(key) {
    if (!paused) {
      if (key === '<up>') {
        camera.transform.translation[1] -= 50
      }
      if (key === '<down>') {
        camera.transform.translation[1] += 50
      }
      if (key === '<left>') {
        camera.transform.translation[0] -= 50
      }
      if (key === '<right>') {
        camera.transform.translation[0] += 50
      }
      if (key === ',') {
        camera.transform.scale += 0.1
      }
      if (key === '.') {
        camera.transform.scale -= 0.1
      }
      drawEditor()
    }
  })

  function rebuildGame() {
    world.reload(schema.tiles)
    
  }

  function drawEditor() {
    var context = editor.getContext('2d')
    context.clearRect(0, 0, editor.width, editor.height)
    world.draw(context, camera)
    schema.start.forEach(function (start) {
      player.moveto(start)
      player.draw(context, camera)
    })
  }

  drawEditor()

  return {
    schema: function() {
      return schema
    },
    pause: function() {
      paused = true
    },
    resume: function() {
      paused = false
    },
    reload: function(updated) {
      schema = updated
      rebuildGame()
      drawEditor()
    }
  }
}