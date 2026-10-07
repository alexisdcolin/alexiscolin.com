#!/usr/bin/env python3
"""Build assets/world-dots.js: the world as a grid of dots, one path per country.

The travel easter egg (scroll.js) lights up the countries of its TRAVEL list,
so a new country needs no new map: each path carries the country's ISO 3166-1
numeric code in data-c. Mainland France and Corsica are "250"; France overseas
is "250o", so a trip to Paris doesn't light up French Guiana.

The SVG ships as a string in a script (window.worldDots) rather than an .svg
file: a script loads from a file:// copy of the site too, where fetch() can't.

Source: Natural Earth 1:50m admin-0 countries (public domain), as TopoJSON
from the world-atlas package. No dependencies; run it from the repo root:

    python3 scripts/world-dots.py [countries-50m.json]
"""
import json
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'world-dots.js'
NORTH, SOUTH = 75, -56                 # Antarctica and the far north left out
COLS, ROWS = 360, NORTH - SOUTH        # one dot per degree
METRO = (-6, 10, 41, 52)               # lon, lon, lat, lat of mainland France


def load():
    if len(sys.argv) > 1:
        return json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    with urllib.request.urlopen(SRC) as r:
        return json.load(r)


def decode_arcs(topo):
    (sx, sy), (tx, ty) = topo['transform']['scale'], topo['transform']['translate']
    arcs = []
    for arc in topo['arcs']:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring(indices, arcs):
    pts = []
    for i in indices:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a if not pts else a[1:])  # neighbouring arcs share an end
    return pts


def unwrap(r):
    """A ring across the antimeridian (Russia, Fiji) jumps from 180° to -180°:
    carried on past 180° instead, it stays one shape for the inside test."""
    out = [r[0]]
    for x, y in r[1:]:
        px = out[-1][0]
        x += 360 * round((px - x) / 360)
        out.append((x, y))
    return out


def polygons(geom, arcs):
    parts = geom['arcs'] if geom['type'] == 'MultiPolygon' else [geom['arcs']]
    return [[unwrap(ring(r, arcs)) for r in part] for part in parts]


def bbox(poly):
    xs = [x for r in poly for x, _ in r]
    ys = [y for r in poly for _, y in r]
    return min(xs), max(xs), min(ys), max(ys)


def inside(lon, lat, poly):
    """Even-odd over every ring, so holes stay out."""
    hit = False
    for r in poly:
        for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
            if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
                hit = not hit
    return hit


def main():
    topo = load()
    arcs = decode_arcs(topo)

    # Every polygon with its country key and box, filed by 10° bucket
    shapes, buckets = [], defaultdict(list)
    for g in topo['objects']['countries']['geometries']:
        if g['type'] not in ('Polygon', 'MultiPolygon'):
            continue
        cid = g.get('id') or g['properties']['name'].lower().replace(' ', '-').replace('.', '')
        for poly in polygons(g, arcs):
            box = bbox(poly)
            key = cid
            if cid == '250':
                cx, cy = (box[0] + box[1]) / 2, (box[2] + box[3]) / 2
                if not (METRO[0] <= cx <= METRO[1] and METRO[2] <= cy <= METRO[3]):
                    key = '250o'
            shapes.append((key, box, poly))
            for bx in range(int(box[0] // 10), int(box[1] // 10) + 1):
                for by in range(int(box[2] // 10), int(box[3] // 10) + 1):
                    buckets[bx, by].append(len(shapes) - 1)

    dots, taken = defaultdict(list), set()
    for row in range(ROWS):
        lat = NORTH - row - .5
        for col in range(COLS):
            here = col - 180 + .5
            found = None
            for lon in (here, here + 360, here - 360):  # shapes carried past ±180°
                for i in buckets.get((int(lon // 10), int(lat // 10)), ()):
                    key, (x0, x1, y0, y1), poly = shapes[i]
                    if x0 <= lon <= x1 and y0 <= lat <= y1 and inside(lon, lat, poly):
                        found = key
                        break
                if found:
                    break
            if found:
                dots[found].append((col, row))
                taken.add((col, row))

    # A country too small for the grid still gets one dot, where its largest
    # part is or in the nearest free cell (Saint-Martin shares its island)
    keys = {key for key, _, _ in shapes}
    for key in sorted(keys - set(dots)):
        x0, x1, y0, y1 = max((b for k, b, _ in shapes if k == key), key=lambda b: (b[1] - b[0]) * (b[3] - b[2]))
        col, row = int((x0 + x1) / 2 + 180) % COLS, int(NORTH - (y0 + y1) / 2)
        near = sorted(((col + dc, row + dr) for dc in (-1, 0, 1) for dr in (-1, 0, 1)), key=lambda p: abs(p[0] - col) + abs(p[1] - row))
        free = [p for p in near if 0 <= p[0] < COLS and 0 <= p[1] < ROWS and p not in taken]
        if free:
            dots[key].append(free[0])
            taken.add(free[0])

    paths = []
    for key in sorted(dots):
        pts = sorted(dots[key], key=lambda p: (p[1], p[0]))
        d, (pc, pr) = [f'M{pts[0][0]} {pts[0][1]}h0'], pts[0]
        for c, r in pts[1:]:
            d.append(f'm{c - pc} {r - pr}h0')
            pc, pr = c, r
        paths.append(f'<path data-c="{key}" d="{"".join(d)}"/>')

    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-.5 -.5 %d %d">%s</svg>' % (COLS, ROWS, ''.join(paths))
    assert "'" not in svg and '\\' not in svg  # safe inside the single-quoted string
    OUT.write_text(
        '// The travel map: Natural Earth 1:50m countries (public domain), one dot\n'
        '// per degree, one path per country. Built by scripts/world-dots.py.\n'
        "window.worldDots = '%s';\n" % svg,
        encoding='utf-8')
    print(f'{OUT.name}: {len(paths)} countries, {len(taken)} dots, {OUT.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
