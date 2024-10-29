class Stroke {
  constructor(clr) {
    this.clr = clr;
    this.points = []
    this.showPoints = []
    
    // -1 for shrinking, 0 for still, 1 for growing
    this.state = 0; 
    this.animSpeed = 60
    this.animPoint = 0;
  }
  addPoint(x, y, thickness) {
    this.points.push(createVector(x, y, thickness))
    this.showPoints.push(createVector(x, y, thickness))
  }
  render() {
    if(this.state == -1) {
      for(let a = this.showPoints.length-1;
          a >= floor(this.animPoint); a--) {
        this.showPoints[a].z = lerp(
          this.showPoints[a].z, 0, this.animSpeed/100)
      }
      if (this.showPoints[0].z / this.points[0].z <= 0.1) {
        this.state = 0
      }
      this.animPoint -= this.animSpeed * 
        (this.showPoints.length/500)
      if(this.animPoint <= 0) {
        this.animPoint = 0
      } 
    } else if (this.state == 1) {
      for(let a = 0;
          a < floor(this.animPoint); a++) {
        this.showPoints[a].z = lerp(
          this.showPoints[a].z, this.points[a].z,
          this.animSpeed/100)
      }
      if (this.showPoints[this.showPoints.length-1].z /
          this.points[this.showPoints.length-1].z >= 0.9) {
        this.state = 0
      }
      this.animPoint += this.animSpeed * 
        (this.showPoints.length/500)
      if(this.animPoint >= this.showPoints.length-1) {
        this.animPoint = this.showPoints.length-1
      } 
    }
    for(let a = 1; a < this.showPoints.length-1; a++) {
      //noStroke()
      fill(this.clr)
      circle(this.showPoints[a].x, this.showPoints[a].y,
            this.showPoints[a].z)
      drawTaperedLine(this.showPoints[a].x, this.showPoints[a].y,
                  this.showPoints[a+1].x, this.showPoints[a+1].y,
                  this.showPoints[a].z, this.showPoints[a+1].z)
      circle(this.showPoints[a+1].x, this.showPoints[a+1].y,
            this.showPoints[a+1].z)
    }
  }
  
  shrink() {
    this.state = -1
    this.animPoint = this.showPoints.length-1
    this.resetSize()
  }
  grow() {
    this.state = 1
    this.animPoint = 0
    for(let a = 1; a < this.showPoints.length-1; a++) {
      this.showPoints[a].z = 0
    }
  }
  
  resetSize() {
    for(let a = 1; a < this.showPoints.length-1; a++) {
      this.showPoints[a].z = this.points[a].z
    }
  }
}

function drawTaperedLine(x1, y1, x2, y2, thicknessStart, thicknessEnd) {
  // Calculate the direction vector of the line
  let angle = atan2(y2 - y1, x2 - x1);
  
  // Calculate the perpendicular offset for thickness at both ends
  let offsetXStart = cos(angle + HALF_PI) * thicknessStart;
  let offsetYStart = sin(angle + HALF_PI) * thicknessStart;
  
  let offsetXEnd = cos(angle + HALF_PI) * thicknessEnd;
  let offsetYEnd = sin(angle + HALF_PI) * thicknessEnd;
    
  // Draw the shape representing the tapered line
  beginShape();
  vertex(x1 - offsetXStart, y1 - offsetYStart); // Start point, left side
  vertex(x1 + offsetXStart, y1 + offsetYStart); // Start point, right side
  vertex(x2 + offsetXEnd, y2 + offsetYEnd);     // End point, right side
  vertex(x2 - offsetXEnd, y2 - offsetYEnd);     // End point, left side
  endShape(CLOSE);
}