modules.collision = {
  title: 'collision', v: '1.0',
  rect: (px, py, x, y, w, h) => { return ((px >= x) && (px <= (x + w)) && (py >= y) && (py <= (y + (h || w)))); },
  circle: (px, py, x, y, range) => { return math.distance(px, py, x, y) <= range; },
  mouse: {
    rect: (x, y, w, h) => { return collision.rect(mouse.x, mouse.y, x * cfg.zoom, y * cfg.zoom, w * cfg.zoom, (h || w) * cfg.zoom); },
    grect: (x, y, w, h) => { return collision.rect(mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y, x, y, w, h || w); },
    circle: (x, y, range) => { return collision.circle(mouse.x, mouse.y, x * cfg.zoom, y * cfg.zoom, range * cfg.zoom); },
    gcircle: (x, y, range) => { return collision.circle(mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y, x, y, range); }
  }
};
