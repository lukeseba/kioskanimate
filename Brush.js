class Brush {  
  constructor(size, clr) {
    if (size == null) {
      this.size = 10
    } else {
      this.size = size
    }
    if (clr == null) {
      this.clr = "black"
    } else {
      this.clr = clr
    }
    this.activeSize = size
    this.pressureMult = 5;
    this.pos = createVector(0,0)
  }
  update(x, y, pressure) {
    this.pos = createVector(x, y)
    this.activeSize = this.size+
      ((pressure-0.9)*this.pressureMult)
  }
  render() {
    fill("rgba(255,0,0,0)")
    stroke("black")
    strokeWeight(1)
    circle(this.pos.x, this.pos.y, this.activeSize)
  }
}