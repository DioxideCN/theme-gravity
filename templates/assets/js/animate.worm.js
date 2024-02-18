let maxPoints = 2000;
let addSpeed  = 4;

class Vec3{
  constructor(x, y, z, r=10){
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
    this.count = 0;
  }
  op(p, f){
    this.x = f(this.x, p.x != undefined ? p.x : p);
    this.y = f(this.y, p.y != undefined ? p.y : p);
    this.z = f(this.z, p.z != undefined ? p.z : p);
    return this;
  }
  plus  (p){return this.op(p, (a, b) => a + b)}
  minus (p){return this.op(p, (a, b) => a - b)}
  times (p){return this.op(p, (a, b) => a * b)}
  div   (p){return this.op(p, (a, b) => a / b)}
  distTo(p){return Math.hypot(this.x-p.x, this.y-p.y, this.x-p.z)}
  clone  (){return new Vec3(this.x, this.y, this.z, this.r)}
  updateRotation(){
    let {x, y, z} = this.clone().minus(origin);
    this.screenCoord = [
      (x*cx - y*sx),
      (y*cx + x*sx)*cy + sy*z
    ];
    this.depth = z*cy - sy*(y*cx + x*sx);
  }
  render(){
    this.count++;
    
    let amt = this.count/maxPoints;
    amt = 1-(cos(amt*addSpeed*TAU)+1)/2;
    amt = pow(amt, .5);
    
    noFill();
    stroke(this.hue, .3, 1, .05);
    strokeWeight(.5);
    
    let r = noise((this.x+frameCount)/200, this.y/200, this.z/200)*50 + 10;
    rect(...this.screenCoord, r*amt, r*amt);
  }
}

function setup (){
  const canvasContainer = document.getElementById('worm-controls');
  pixelDensity(1);
  const canvas = createCanvas();
  canvas.parent(canvasContainer);
  colorMode(HSB, 1, 1, 1);
  rectMode(CENTER);
  windowResized();
}

let points = [];
let r = (n) => random(-n, n);
let v3 = (x, y, z) => new Vec3(x, y, z);
let l3 = (p1, p2, c) => new Line(p1, p2, c);
let rPoint = (n) => v3(r(n), r(n), r(n));

let step = 0;
let d = 200;
let t = 0;
let p = 0;
let nextPoint = () => {
  step++;

  d = lerp(d, 150, .001);
  d += (noise(step/100, 1e6)*2-1)*.1;
  d = constrain(d, 100, 200);
  t += (noise(step/200, 1e7)*2-1)*.02;
  p += (noise(step/200, 1e8)*2-1)*.02;

  let x = d * sin(t) * cos(p);
  let z = d * sin(t) * sin(p);
  let y = d * cos(t);

  let v = v3(x, y, z);
  v.hue = ((step/3)/maxPoints)%1;
  return v;
}

let init = () => {
  points = [];
  step = 0;
  d = 200;
  t = 0;
  p = 0;
  
  noiseSeed(random()*1e8);
  
  for (let i = 0; i < maxPoints; i++){    
    points.push(nextPoint());
  }
}

let rotY = -Math.PI/4;
let rotX = .4;
let zoom = 2;
let cx, sx, cy, sy;

let near = 500;

let mX = 0;
let mY = 0;

let origin = new Vec3(0, 0, 0);

function draw(){
  background(0, .3);
  stroke(1);
  
  push();
  updateCamera();
  translate(width/2, height/2);
  scale(zoom);
  let [x, y] = origin.screenCoord;
  translate(x, y);
  
  let n = near/(zoom*zoom);
  
  blendMode(ADD);
  for (let i = 0; i < addSpeed; i++){
    points.shift();
    points.push(nextPoint());
  }
  points.map(p => p.updateRotation());
  points.map(p => p.render());
  pop();
}

let updateCamera = () => {
  rotX += mX;
  rotY += mY;
  rotY = constrain(rotY, -PI, 0);
  mX *= .9;
  mY *= .9;
  
  [cx, sx, cy, sy] = [cos(rotX), sin(rotX), cos(rotY), sin(rotY)];
  
  rotX += .002;
  
  origin.updateRotation();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  zoom = min(width, height)*2/862;
  init();
}