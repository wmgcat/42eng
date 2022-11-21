modules.graphics = {
  title: 'graphics', v: '1.0',
  init: context2d => {
    this.cvs = context2d;
    Add.debug('graphics.js initialized');
  },
  save: func => {
    let _save = {
      fillStyle: this.cvs.fillStyle, strokeStyle: this.cvs.strokeStyle,
      globalAlpha: this.cvs.globalAlpha, lineWidth: this.cvs.lineWidth,
      font: this.cvs.font
     };
     if (func) func();
     Object.keys(save).forEach(key => { this.cvs[key] = _save[key]; });
  }
}

/*
class Graphics {	
	rect(x, y, w, h, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs[type + 'Rect'](x, y, w, h);
		});
		return { 'x': x, 'y': y, 'w': w, 'h': h };
	}
	round(x, y, w, h, range, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.lineTo(x, y + range);
				this.cvs.quadraticCurveTo(x, y, x + range, y);
				this.cvs.lineTo(x + range, y);
				this.cvs.lineTo(x + w - range, y);
				this.cvs.quadraticCurveTo(x + w, y, x + w, y + range);
				this.cvs.lineTo(x + w, y + h - range);
				this.cvs.quadraticCurveTo(x + w, y + h, x + w - range, y + h);
				this.cvs.lineTo(x + w - range, y + h);
				this.cvs.lineTo(x + range, y + h);
				this.cvs.quadraticCurveTo(x, y + h, x, y + h - range);
				this.cvs.lineTo(x, y + h - range);
				this.cvs.lineTo(x, y + range);
				this.cvs[type]();
			this.cvs.closePath();
		});
		return { 'x': x, 'y': y, 'w': w, 'h': h };
	}
	circle(x, y, radius, start, end, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.arc(x, y, radius, start, end);
				this.cvs[type]();
			this.cvs.closePath();
		});
	}
	ellipse(x, y, w, h, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
				this.cvs[type]();
			this.cvs.closePath();
		});
	}
	text(text, x, y, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			if (align) {
				let dt = align.split('-');
				if (dt) {
					if (dt[0]) this.cvs.textAlign = dt[0];
					if (dt[1]) this.cvs.textBaseline = dt[1];
				}
			}
			this.cvs.font = `${size}px ${font}`;
			this.cvs[type + 'Text'](lang.use(text) || text, x, y);
		});
		return this.len(text, size, font);
	}
	wtext(text, x, y, width, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) {
		let pos = 0, nstr = '', spaces = [];
		if (typeof(text) == 'object') { assoc = text[1], text = (lang.use(text[0]) || text[0]); }
		else text = lang.use(text) || text;
		while (pos < text.length) {
			nstr += text[pos++];
			let w = this.len(nstr, size, font);
			if (w >= width * .675) {
				spaces.push([pos, w]);
				nstr = '';
			}
		}
		if (nstr != '') spaces.push([text.length, this.len(nstr, size, font)]);
		let yy = y;
		if (align) {
			let dt = align.split('-');
			switch(dt[1]) {
				case 'middle': yy = y - (spaces.length * size) * .5; break;
				case 'bottom': yy = y - (spaces.length * size); break;
			}	
		}
		for (let i = 0, offset = 0; i < spaces.length; i++) {
			gr.text(text.slice(offset, spaces[i][0]), x, y + i * size, colour, alpha, size, font, type, align, lw);
			offset = spaces[i][0];
		}
		return { w: spaces[0][1], h: spaces.length * size };
	}
	len(text, size=10, font='Arial') {
		let savefont = this.cvs.font;
			this.cvs.font = size + 'px ' + (font || 'Arial');
			let width = this.cvs.measureText(lang.use(text) || text).width;
		this.cvs.font = savefont;
		return width;
	}
	image(img, x, y, w, h) { if (img) this.cvs.drawImage(img, x, y, w, h); }
}

let Img = {
	'init': function(path, left, top, w, h, xoff, yoff, count) {
		this.path = path, this.image = images[path], this.left = left || 0, this.top = top || 0,
		this.w = w || (this.image.width || 0), this.h = h || this.image.height, this.count = count || 1,
		this.xoff = xoff || 0, this.yoff = yoff || 0, this.frame = 0, this.frame_spd = 1;
		return Eng.copy(this);
	},
	'draw': function(cvs, x, y, w, h, alpha, xscale, yscale, rotate) {
		try {
			if (this.image) {
				cvs.save();
					if (alpha != undefined) cvs.globalAlpha = alpha;
					let nxoff = ((w || this.w) / this.w) * this.xoff, nyoff = ((h || this.h) / this.h) * this.yoff;
					cvs.translate((x || 0) - nxoff * (xscale || 1), (y || 0) - nyoff * (yscale || 1));
					if (xscale != undefined || yscale != undefined) cvs.scale(xscale || 1, yscale || 1);
					if (rotate != undefined) {
						cvs.translate(nxoff, nyoff);
						cvs.rotate(rotate / 180 * Math.PI);
						cvs.translate(-nxoff, -nyoff);
					}
					cvs.drawImage(this.image, this.left + this.w * Math.floor(this.frame % ((this.image.width || 0) / this.w)), this.top + this.h * Math.floor(this.frame / ((this.image.width || 0) / this.w)), this.w, this.h, 0, 0, w || this.w, h || this.h);
					cvs.globalAlpha = 1;
				cvs.restore();
				this.frame = (this.frame + this.frame_spd) % this.count;

			} else this.image = images[this.path];
		} catch(err) { this.init(this.path, this.left, this.top, this.w, this.h, this.xoff, this.yoff, this.count); }
	}
};


*/
