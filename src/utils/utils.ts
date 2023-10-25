function getOrderedPoints(p1: Point, p2: Point) {
  const sx = Math.min(p1.x, p2.x);
  const sy = Math.min(p1.y, p2.y);
  const ex = Math.max(p1.x, p2.x);
  const ey = Math.max(p1.y, p2.y);
  return [
    { x: sx, y: sy },
    { x: ex, y: ey },
  ] as [Point, Point];
}

export { getOrderedPoints };
