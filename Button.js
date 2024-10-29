class Button {
  constructor(shape, clr, x, y, w, h, txt, txtclr, func) {
    this.shape = shape
    this.x = x
    this.y = y
    this.defaultW = w
    this.defaultH = h
    this.hoverMult = 1
    this.depressMult = 1.1
    this.w = w
    this.h = h
    this.txt = txt
    this.setColor(clr)
    this.txtclr = txtclr
    this.setTextSize()
    this.defaultShadowSize = 50
    this.hoverShadowSize = 20
    this.hoverAnimSpeed = 30
    this.shadowSize = 50
    this.clicked = false
    this.func = func
    this.hovering = false
    this.mouseDown = false
  }
  setTextSize() {
    let txtW = this.txt.length/1.3
    let txtH = 1
    this.txtSize = min(this.w/1.3/txtW, this.h/1.3/txtH)
    textSize(this.txtSize)
  }
  update() {
    if (mouseIsPressed && !this.hovering) {
      this.mouseDown = true
    } else if (!mouseIsPressed) {
      this.mouseDown = false
    }
    if(mouseX > this.x - this.w/2 && mouseX < this.x + this.w/2 &&
       mouseY > this.y - this.h/2 && mouseY < this.y + this.h/2) {
      this.hovering = true
      this.shadowSize = lerp(this.shadowSize, 
                            this.hoverShadowSize,
                            this.hoverAnimSpeed/100)
      this.w = lerp(this.w, this.defaultW * this.hoverMult,
                   this.hoverAnimSpeed/100)
      this.h = lerp(this.h, this.defaultH * this.hoverMult,
                   this.hoverAnimSpeed/100)
      if(mouseIsPressed) {
        if (!this.clicked) {
          this.func()
        }
        this.clicked = true
        this.shadowSize = this.defaultShadowSize*this.depressMult
        this.h = this.defaultH / this.depressMult
        this.w = this.defaultW / this.depressMult
      } else if (!mouseIsPressed) {
        this.clicked = false
      }
    } else {
      this.hovering = false
      this.shadowSize = lerp(this.shadowSize, 
                            this.defaultShadowSize,
                            this.hoverAnimSpeed/200)
      this.w = lerp(this.w, this.defaultW,
                   this.hoverAnimSpeed/200)
      this.h = lerp(this.h, this.defaultH,
                   this.hoverAnimSpeed/200)
    }
  }
  render() {
    rectMode(CENTER)
    strokeWeight(1)
    stroke(this.outlineClr)
    fill(this.shadowClr)
    this.drawShape(this.x, this.y, 
                   this.w, this.h, (this.w+this.h)/20)
    noStroke()
    for(let i = 0; i < this.shadowSize; i++) {  
      fill(color(
      lerp(red(this.shadowClr), red(this.clr),
           i/this.shadowSize),
      lerp(green(this.shadowClr), green(this.clr),
           i/this.shadowSize),    
      lerp(blue(this.shadowClr), blue(this.clr),
           i/this.shadowSize),
      ))
      let lightW = this.w/(1+this.shadowSize/100)
      let lightH = this.h/(1+this.shadowSize/100)
      this.drawShape(lerp(this.x, this.x+(this.w-lightW)/8,
               i/this.shadowSize),
           lerp(this.y, this.y-(this.h-lightH)/8,
               i/this.shadowSize), 
           lerp(this.w, lightW,
                i/this.shadowSize),
           lerp(this.h, lightH,
                i/this.shadowSize),
           (this.w+this.h)/20)
    }
    textFont('Courier New');
    textAlign(CENTER, CENTER)
    this.setTextSize()
    noStroke()
    fill(this.txtclr)
    text(this.txt, this.x, this.y)
  }
  drawShape(x, y, w, h, r) {
    if (this.shape == "ellipse") {
      ellipse(x, y, w, h)
    } else if (this.shape == "rectangle") {
      rect(x, y, w, h, r)
    }
  }
  setColor(clr) {
    this.clr = clr
    this.outlineClr = color(red(clr)/2, green(clr)/2, blue(clr)/2)
    this.shadowClr = color(red(clr)/1.2, green(clr)/1.2, blue(clr)/1.2)
  }
}