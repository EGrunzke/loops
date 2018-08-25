const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const footer = document.getElementById("footer")!;
const buffer_canvas = document.createElement("canvas");

const pi = Math.PI;

// a tile is a bitfield:
//   8
// 4   1
//   2

type Level = {tiles_per_row: number, tiles: number[]};
const tutorial_levels: Level[] = [
  { tiles_per_row: 4,
    tiles: [
      0,0,0,0,
      0,6,1,0,
      0,6,2,0,
      0,0,0,0,
    ],
  },
  { tiles_per_row: 5,
    tiles: [
      0, 0, 0, 0, 0,
      0, 6,14,12, 0,
      0, 3, 9, 4, 0,
      0, 0, 0, 0, 0,
    ],
  },
  { tiles_per_row: 5,
    tiles: [
      0, 0, 0, 0, 0,
      0, 2, 3, 4, 0,
      0, 2, 1, 5, 0,
      0,12, 1, 4, 0,
      0, 0, 0, 0, 0,
    ]
  },
];
var tutorial_index = 0;

// these are set by loadLevel()
var tiles = [
  0,0,0,
  0,3,0,
  0,0,0,
];
var tiles_per_row = 3;
var tiles_per_column = tiles.length / tiles_per_row;

enum GameState {
    Playing,
    FadeOut,
    FadeIn,
}
var game_state = GameState.Playing;

function loadLevel(level: Level) {
  tiles = level.tiles.slice();
  tiles_per_row = level.tiles_per_row;
  tiles_per_column = tiles.length / tiles_per_row;
  handleResize();
}

window.addEventListener("resize", function() {
  handleResize();
});
canvas.addEventListener("mousedown", function(event: MouseEvent) {
  if (event.altKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  if (game_state !== GameState.Playing) return;
  const tile_x = Math.floor((event.x - origin_x) / scale);
  const tile_y = Math.floor((event.y - origin_y) / scale);
  rotateTile(tile_x, tile_y);
});

// these are calculated below
var scale = 100;
var origin_x = -50;
var origin_y = -50;
function handleResize() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight - footer.clientHeight;
  buffer_canvas.width = canvas.width;
  buffer_canvas.height = canvas.height;

  // cut off half of the border tiles
  const display_tiles_per_column = tiles_per_column - 1;
  const display_tiles_per_row = tiles_per_row - 1;

  const tile_aspect_ratio = display_tiles_per_column / display_tiles_per_row;
  const canvas_aspect_ratio = canvas.height / canvas.width;
  scale =
    tile_aspect_ratio < canvas_aspect_ratio ?
    canvas.width / display_tiles_per_row :
    canvas.height / display_tiles_per_column;

  origin_x = canvas.width / 2 - scale * tiles_per_row / 2;
  origin_y = canvas.height / 2 - scale * tiles_per_column / 2;

  renderEverything();
}

function renderEverything() {
  const context = buffer_canvas.getContext("2d")!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, buffer_canvas.width, buffer_canvas.height);

  context.fillStyle = "#000";
  context.lineWidth = scale * 0.1;
  context.lineCap = "round";
  for (var y = 0; y < tiles_per_column; y++) {
    for (var x = 0; x < tiles_per_row; x++) {
      const tile = tiles[tileIndex(x, y)];
      context.save();
      try {
        renderTile(tile, x, y);
      } finally {
        context.restore();
      }
    }
  }

  // render the game into the real canvas with the alpha blend
  const real_context = canvas.getContext("2d")!;
  real_context.fillStyle = "#fff";
  real_context.fillRect(0, 0, canvas.width, canvas.height);
  real_context.save();
  real_context.globalAlpha = global_alpha;
  real_context.drawImage(buffer_canvas, 0, 0);
  real_context.restore();

  function renderTile(tile: number, x: number, y: number) {
    context.translate(origin_x + scale*(x + 0.5), origin_y + scale*(y + 0.5));
    // normalize rotation
    switch (tile) {
      case 0: return;
      case 1: break;
      case 2: tile = 1; context.rotate(pi/2); break;
      case 3: break;
      case 4: tile = 1; context.rotate(pi); break;
      case 5: break;
      case 6: tile = 3; context.rotate(pi/2); break;
      case 7: break;
      case 8: tile = 1; context.rotate(pi*1.5); break;
      case 9: tile = 3; context.rotate(pi*1.5); break;
      case 10: tile = 5; context.rotate(pi/2); break;
      case 11: tile = 7; context.rotate(pi*1.5); break;
      case 12: tile = 3; context.rotate(pi); break;
      case 13: tile = 7; context.rotate(pi); break;
      case 14: tile = 7; context.rotate(pi/2); break;
      case 15: break;
      default: throw new AssertionFailure();
    }
    switch (tile) {
      case 1:
        context.beginPath();
        context.arc(0, 0, scale*0.25, 0, 2*pi);
        context.lineTo(scale * 0.5, 0);
        context.stroke();
        break;
      case 3:
        context.beginPath();
        context.arc(scale * 0.5, scale * 0.5, scale * 0.5, pi, pi*1.5);
        context.stroke();
        break;
      case 5:
        context.beginPath();
        context.moveTo(scale * 0.5, 0);
        context.lineTo(scale * -0.5, 0);
        context.stroke();
        break;
      case 7:
        context.beginPath();
        context.arc(scale * -0.5, scale * 0.5, scale * 0.5, pi*1.5, 2*pi);
        context.stroke();
        context.beginPath();
        context.arc(scale * 0.5, scale * 0.5, scale * 0.5, pi, pi*1.5);
        context.stroke();
        break;
      case 15:
        context.beginPath();
        context.arc(scale * 0.5, scale * 0.5, scale * 0.5, pi, pi*1.5);
        context.stroke();
        context.beginPath();
        context.arc(scale * 0.5, scale * -0.5, scale * 0.5, pi/2, pi);
        context.stroke();
        context.beginPath();
        context.arc(scale * -0.5, scale * -0.5, scale * 0.5, 0, pi/2);
        context.stroke();
        context.beginPath();
        context.arc(scale * -0.5, scale * 0.5, scale * 0.5, pi*1.5, 2*pi);
        context.stroke();
        break;
      default:
        throw new AssertionFailure();
    }
  }
}

function tileIndex(x: number, y: number): number {
  return y * tiles_per_row + x;
}

function rotateTile(x: number, y: number) {
  if (x <= 0 || x >= tiles_per_row - 1 ||
      y <= 0 || y >= tiles_per_column - 1) {
    // out of bounds
    return;
  }
  const index = tileIndex(x, y);
  var tile = tiles[index];
  tile = 0xf & ((tile << 1) | (tile >> 3));
  tiles[index] = tile;
  renderEverything();

  checkForDone();
}

function checkForDone() {
  // the border tiles don't rotate, so they're always solved.
  for (var y = 0; y < tiles_per_column - 1; y++) {
    for (var x = 0; x < tiles_per_row - 1; x++) {
      const tile = tiles[tileIndex(x, y)];
      const right_tile = tiles[tileIndex(x + 1, y)];
      const down_tile = tiles[tileIndex(x, y + 1)];
      if (!!(tile & 1) !== !!(right_tile & 4)) return;
      if (!!(tile & 2) !== !!(down_tile & 8)) return;
    }
  }
  // everything is done
  beginLevelTransition();
}
var global_alpha = 1.0;
function beginLevelTransition() {
  game_state = GameState.FadeOut;
  const start_time = new Date().getTime();
  animate();

  function animate() {
    const progress = (new Date().getTime() - start_time) / 1000;
    if (progress < 1) {
      global_alpha = 1 - progress;
    } else if (progress < 2) {
      if (game_state === GameState.FadeOut) {
        loadNewLevel();
        game_state = GameState.FadeIn;
      }
      global_alpha = progress - 1;
    } else {
      // done
      game_state = GameState.Playing;
      global_alpha = 1.0;
    }
    renderEverything();
    if (game_state !== GameState.Playing) {
      requestAnimationFrame(animate);
    }
  }
}
function loadNewLevel() {
  if (tutorial_index < tutorial_levels.length - 1) {
    tutorial_index += 1;
    loadLevel(tutorial_levels[tutorial_index]);
  } else {
    loadLevel(generateLevel(tiles_per_row + 1, tiles_per_row + 1));
  }
}

function generateLevel(tiles_per_row: number, tiles_per_column: number): Level {
  const level: Level = {
    tiles_per_row,
    tiles: [],
  };
  for (var i = 0; i < tiles_per_row * tiles_per_column; i++) {
    level.tiles.push(0);
  }

  // generate a solved puzzle
  for (var y = 1; y < tiles_per_column - 2; y++) {
    for (var x = 1; x < tiles_per_row - 2; x++) {
      if (Math.random() < 0.5) {
        // connect right
        level.tiles[y * tiles_per_row + x] |= 1;
        level.tiles[y * tiles_per_row + x + 1] |= 4;
      }
      if (Math.random() < 0.5) {
        // connect down
        level.tiles[y * tiles_per_row + x] |= 2;
        level.tiles[(y + 1) * tiles_per_row + x] |= 8;
      }
    }
  }
  // rotate the tiles randomly
  for (var y = 1; y < tiles_per_column - 1; y++) {
    for (var x = 1; x < tiles_per_row - 1; x++) {
      const rotations = Math.floor(Math.random() * 4);
      if (rotations === 0) continue;
      const index = y * tiles_per_row + x;
      var tile = level.tiles[index];
      tile = 0xf & ((tile << rotations) | (tile >> (4 - rotations)));
      level.tiles[index] = tile;
    }
  }
  return level;
}

class AssertionFailure {}

loadLevel(tutorial_levels[tutorial_index]);