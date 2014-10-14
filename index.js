var datas = [];
var frames = [];
var c = document.createElement('canvas');
var sc = document.getElementById('screen');
c.width = 352;
c.height = 240;
var ctx = c.getContext('2d');
var scCtx = sc.getContext('2d');
var i = 0;
var fps = 100;
var win = 20;
var bw = false;
var threshold = 20;

function loadImage() {
  var image = 'data/' + images.pop();
  var im = new Image();
  im.onload = function() {
    ctx.drawImage(im, 0, 0);
    datas.push(ctx.getImageData(0, 0, 352, 240));
    if (images.length) loadImage();
    else complete();
  };
  im.src = image;
}

function complete() {
  // frames = datas;
  frames = isolate();
  tick();
}

function tick() {
  if (++i > frames.length - 1) i = 0;
  scCtx.putImageData(frames[i], 0, 0);
  setTimeout(tick, fps);
}

function isolate() {
  console.time('isolate');
  var refs = [];
  var output = [];
  for (var j = 0; j < datas.length; j += win) {
    var sl = datas.slice(j, j + win);
    var ref = median(sl);
    refs.push(ref);
  }
  console.timeEnd('isolate');
  console.time('subtract');
  for (var i = 0; i < datas.length; i++) {
    output.push(subtract(datas[i], refs[Math.floor(i / win)]));
  }
  console.timeEnd('subtract');
  return output;
}

function subtract(a, b) {
  var out = scCtx.createImageData(352, 240);
  for (var i = 0; i < a.data.length; i += 4) {
    if (Math.abs(a.data[i + 0] - b.data[i + 0]) > threshold) {
      out.data[i + 0] = a.data[i + 0];
      out.data[i + 1] = a.data[i + 1];
      out.data[i + 2] = a.data[i + 2];
      out.data[i + 3] = a.data[i + 3];
    } else {
      if (bw) {
        out.data[i + 0] = 0;
        out.data[i + 1] = 0;
        out.data[i + 2] = 0;
        out.data[i + 3] = 255;
      }
    }
  }
  return out;
}

function median(datas) {
  var out = scCtx.createImageData(352, 240);
  for (var i = 0; i < out.data.length; i++) {
    var values = [];
    for (var j = 0; j < datas.length; j++) {
      values.push(datas[j].data[i]);
    }
    values.sort(sortNumeric);
    out.data[i] = values[Math.floor(values.length/2)];
  }
  return out;
}

function sortNumeric(a, b) { return a - b; }

document.getElementById('fps').onchange = function(e) {
  fps = parseFloat(e.target.value);
};

document.getElementById('threshold').onchange = function(e) {
  threshold = parseFloat(e.target.value);
  frames = isolate();
};

document.getElementById('win').onchange = function(e) {
  win = parseFloat(e.target.value);
  frames = isolate();
};

document.getElementById('bw').onchange = function(e) {
  bw = !!e.target.checked;
  console.log(bw);
  frames = isolate();
};

loadImage();
