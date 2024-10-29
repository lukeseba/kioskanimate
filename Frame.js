class Frame{
  constructor(w, h) {
    this.penIsDown = false
    this.w = w
    this.h = h
    this.strokes = []
    this.undidStrokes = []
    this.clr = "white"
    this.brush = new Brush();
  }
  
  render(transp) {
    let bgTransp = transp
    if (transp == null) {
      bgTransp = 1
    }
    fill(color(red(this.clr),
                    green(this.clr),
                    blue(this.clr),
                    255/(transp/1.5)))
    rect(width/2, height/2, width, height)
    for (let i = 0; i < this.strokes.length; i++) {
      this.strokes[i].render()
    }
    for (let i = 0; i < this.undidStrokes.length; i++) {
      if(this.undidStrokes[i].state == -1) {
        this.undidStrokes[i].render()
      }
    }
  }
  penDown(brush) {
    this.brush = brush
    this.penIsDown = true
    this.strokes.push(new Stroke(brush.clr))
    this.undidStrokes = []
  }
  penUp() {
    this.penIsDown = false
  }
  penMove() {
    if(this.penIsDown){
      if(this.strokes.length == 0) {
        this.penDown(this.brush)
      }
      this.strokes[this.strokes.length - 1].addPoint(
        this.brush.pos.x, this.brush.pos.y,
        this.brush.activeSize)
    }
  }
  undo() {
    if(this.strokes.length > 0) {
      this.undidStrokes.push(this.strokes.pop())
      this.undidStrokes[this.undidStrokes.length-1].shrink()
    }
  }
  redo() {
    if(this.undidStrokes.length > 0) {
      this.strokes.push(this.undidStrokes.pop())
      this.strokes[this.strokes.length-1].grow()
    }
  }
  clear() {
    while(this.strokes.length > 0) {
      undo()
    }
  }
}