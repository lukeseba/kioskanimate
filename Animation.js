class Animation {
  constructor(onions) {
    this.frames = [];
    this.fps = 6;
    this.playing = false;
    this.paused = false;
    this.currentFrame = 0;
    this.onions = onions
  }
  renderOnions(num) {
    for (let i = max(0, this.frames.length - num);
         i < this.frames.length; i++) {
      this.frames[i].render(num)
    }
  }
  
  addFrame(frame) {
    this.frames.push(frame)
  }
  
  removeFrame(i) {
    this.frames.splice(i, 1)
  }
  
  play() {
    if(this.frames.length > 0) {  
      this.playing = true;
      this.paused = false
      frameRate(this.fps)
    }
  }
  
  pause() {
    this.paused = true;
  }
  
  stop() {
    this.playing = false;
    this.currentFrame = 0;
    frameRate(60)
  }
  
  speed(rate) {
    this.fps = rate
  }
  
  render() {
    if(this.playing) {
      this.frames[this.currentFrame].render(1)
      if(!this.paused) {
        this.currentFrame++
      }
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = 0;
      }
    } else {
      this.renderOnions(this.onions)
    }
  }
}