class Timer {
	constructor(x, multi=1000) { 
		this.max = x * multi, this.save_max = x, this.point = 0;
		this.reset();
	}
	check(loop) {
		if ((this.point - Date.now()) <= 0) {
			if (!loop) this.reset();
			return true;
		}
		return false;
	}
	delta() { return Eng.math.clamp(Math.max(this.point - Date.now(), 0) / this.max, 0, 1); }
	count() { return Math.floor(Math.abs(this.point - Date.now()) / this.max); }
	reset(x=0) { 
		if (x == 0) this.point = Date.now() + this.max;
		else this.point = x; 
	}
}
