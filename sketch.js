/***********************
*       SETTINGS       *
************************/

// How sensitive is the brush size to the pressure of the pen?
var pressureMultiplier = 10; 

// What is the smallest size for the brush?
var minBrushSize = 1;

// Higher numbers give a smoother stroke
var brushDensity = 5;

var showDebug = false;

// Jitter smoothing parameters
// See: http://cristal.univ-lille.fr/~casiez/1euro/
var minCutoff = 0.0001; // decrease this to get rid of slow speed jitter but increase lag (must be > 0)
var beta      = 1.0;  // increase this to get rid of high speed lag


/***********************
*       GLOBALS        *
************************/
var xFilter, yFilter, pFilter;
var inBetween;
var penX = 0;
var penY = 0;
var prevPenX = 0;
var prevPenY = 0; 
var prevBrushSize = 1;
var amt, x, y, s, d;
var pressure = -2;
var drawCanvas, uiCanvas;
var isPressureInit = false;
var isDrawing = false;
var isDrawingJustStarted = false;

// MY OWN STUFF ----------------------

let brush, frame, animation, buttons, nextFrameButton
let hovering, colors, colorTray
let brushX, brushY
let didAction, wipeAnim
let onions
let iteration, code, checkLoading

function setup() {
  frameRate(60)
  // Filters used to smooth position and pressure jitter
  xFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);
  yFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);
  pFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);

  // prevent scrolling on iOS Safari
  disableScroll();
  
  canvas = createCanvas(windowWidth,windowHeight);
  // canvas = createCanvas(1920,1080);
  
  canvas.id("uiCanvas")
  canvas.position(0,0)
  textAlign(CENTER);
  pixelDensity(displayDensity());
  
  // SET ANIMATION OBJECTS
  brush = new Brush(3)
  frame = new Frame(width, height)
  animation = new Animation(2)
  iteration = 1
  animationData = [""]
  
  colors = ["rgb(251,47,85)", "#FFC107", "#8BC34A", "#00BCD4", "#9C27B0",  "black", "#9E9E9E", "white"]
  nextFrameButton = new Button("rectangle", "#76a743", 
               width-height/8, height/10, 
               height/8, height/8, 
               "✅", "black", nextFrame)
  buttons = [
    new Button("rectangle", "rgb(255,255,255)", 
               height/8, height/10, 
               height/8, height/10, 
               "↶", "black", undo),
    new Button("rectangle", "rgb(255,255,255)", 
               height/3.6, height/10,
               height/8, height/10,
               "↷", "black", redo),
    new Button("rectangle", "rgb(255,255,255)", 
               height/2, height/10,
               height/8, height/8,
               "🗑️", "black", clearScreen),
    nextFrameButton
  ]
  for (let i = 0; i < colors.length; i++) {
    buttons.push(
      new Button("ellipse", colors[i], 
                 height/8*i + height/32 +
                 (width-height/8*colors.length+height/20)/2,
                 height-height/10,
                 height/10, height/10, 
                 "", "", 
               () => {
        brush.clr = colors[i]
      }))
  }
    
  colorTray = new Button("rectangle", "black",
                       width/2, height,
                       height/8 * colors.length, height/15, 
                       "", "", () => {})
}

function draw() {
  // Start Pressure.js if it hasn't started already
    if(isPressureInit == false){
      initPressure();
    }
      
  // update stuff
  
  hovering = false
  for (let b = 0; b < buttons.length; b++) {
    buttons[b].update()
    if (buttons[b].hovering) {
      hovering = true
    }
  }
  if(keyIsPressed && !didAction) {
    didAction = true
    if(key == '1' && (!animation.playing || animation.paused)) {
      animation.play()
    } else if (key == '2') {
      animation.pause()
    } else if (key == '3') {
      animation.stop()
    } else if (key == '4') {
      delFrame()
    } else if (key == '5') {
      loadAnimation()
    }
  } else if (!keyIsPressed) {
    didAction = false
  }
  
  checkLoad()
  colorTray.setColor(brush.clr);
  brush.update(penX, penY, pressure)
  
  if(isDrawing && touches.length == 1) {    
    // Smooth out the position of the pointer 
    penX = xFilter.filter(mouseX, millis());
    penY = yFilter.filter(mouseY, millis());

    // What to do on the first frame of the stroke
    if(isDrawingJustStarted && !hovering) {
      //console.log("started drawing");
      prevPenX = penX;
      prevPenY = penY;
      frame.penDown(brush)
    }
    if(!hovering){
      frame.penMove()
    }

    // Smooth out the pressure
    pressure = pFilter.filter(pressure, millis());

    isDrawingJustStarted = false;
  } else {
    frame.penUp()
  }
  
  // render stuff
  
  background(255)

  animation.render()
  if(!animation.playing) {
    frame.render(2)
    brush.render()
    for (let b = 0; b < buttons.length; b++) {
      buttons[b].render()
    }
    colorTray.render()
  }
    
  
  if (wipeAnim != 0) {
    playWipe()
  }
}


function scaleToWindow() {
  createCanvas(windowWidth, windowHeight);
}

function disableScroll(){
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}

// Initializing Pressure.js
// https://pressurejs.com/documentation.html
function initPressure() {
  
  	//console.log("Attempting to initialize Pressure.js ");
  
    Pressure.set('#uiCanvas', {
      start: function(event){
        // this is called on force start
        isDrawing = true;
        isDrawingJustStarted = true;
  		},
      end: function(){
    		// this is called on force end
        isDrawing = false
        pressure = 0;
  		},
      change: function(force, event) {
        if (isPressureInit == false){
          console.log("Pressure.js initialized successfully");
	        isPressureInit = true;
      	}
        //console.log(force);
        pressure = force;
        
      }
    });
  
    Pressure.config({
      polyfill: true, // use time-based fallback ?
      polyfillSpeedUp: 1000, // how long does the fallback take to reach full pressure
      polyfillSpeedDown: 300,
      preventSelect: true,
      only: null
 		 });
  
}

function preventDefault(e){
    e.preventDefault();
}

// BUTTON FUNCTIONS

function undo() {
  frame.undo();
}
function redo() {
  frame.redo();
}
function clearScreen() {
  frame.clear();
}
function nextFrame() {
  animation.addFrame(frame)
  frame = new Frame(width, height)
  wipeAnim = 1
  saveAnimation()
}
function delFrame() {
  if (animation.frames.length > 0) {  
    frame = animation.frames[animation.frames.length-1]
    animation.removeFrame(animation.frames.length-1)
  }
}
function playWipe() {
  fill("#76a743")
    wipeAnim+=width/10
  if(wipeAnim > 0) {
    circle(nextFrameButton.x, nextFrameButton.y, wipeAnim)
  } else if (wipeAnim < 0) {
    circle(-width, height, wipeAnim)
    if (wipeAnim >= -width/10) {
      wipeAnim = 0
    }
  }
  if (wipeAnim >= width*2) {
    wipeAnim = -width*2
  }
}
function loadAnimation() {
  if (!checkLoading) {
    checkLoading = true
    code = undefined
    setCodeFromClipboard()
  }
}
function checkLoad() {
  if(checkLoading && code != undefined) {
    checkLoading = false
    setAnimation(code)
  }
}
function setAnimation(inCode) {
  animation = new Animation(animation.onions)
  splitCode = inCode.split(" ")
  for (let a = 0; a < splitCode.length; a++) {
    let tempFrame = new Frame(width, height)
    currentFrame = splitCode[a]
    frameSplit = currentFrame.split("|")
    console.log("Frame: "+a+" -- "+currentFrame)
    for (let s = 0; s < frameSplit.length; s++) {
      currentStroke = frameSplit[s]
      let strokeSplit = currentStroke.split("?")
      let strokeClr = strokeSplit[0]
      let strokePoints = strokeSplit[1].split(":")
      console.log("Stroke: "+s+" -- "+currentStroke)
      tempStroke = new Stroke(strokeClr)
      for (let p = 0; p < strokePoints.length; p++) {
        currentPoint = strokePoints[p].split(",")
        console.log("Point: "+p+" -- "+currentPoint)
        tempStroke.addPoint(parseFloat(currentPoint[0]), 
                            parseFloat(currentPoint[1]), 
                            parseFloat(currentPoint[2]))
      }
      tempFrame.strokes.push(tempStroke)
    }
    animation.addFrame(tempFrame)
  }
}

function saveAnimation() {
  animationData = [""]
  for (let a = 0; a < animation.frames.length; a++) {
    let currentFrame = animation.frames[a]
    let frameText = ""
    for(let s = 0; s < currentFrame.strokes.length; s++) {
      let currentStroke = currentFrame.strokes[s]
      let strokeText = ""+currentStroke.clr+"?"
      for(let p = 0; p < currentStroke.points.length; p++) {
        let currentPoint = currentStroke.points[p]
        let pointText = round(currentPoint.x*10)/10+","+
            round(currentPoint.y*10)/10+","+
            round(currentPoint.z*100)/100
        strokeText += pointText
        if(p < currentStroke.points.length-1) {
          strokeText+=":"
        }
      }
      frameText += strokeText
      if(s < currentFrame.strokes.length-1) {
        frameText+="|"
      }
    }
    animationData[0] += frameText
    if(a < animation.frames.length-1) {
      animationData[0]+=" "
    }
  }
  save(animationData, 'ver_'+iteration)
  iteration++
}

async function setCodeFromClipboard() {
  try {
    const txt = await navigator.clipboard.readText();
    code = txt;
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}
