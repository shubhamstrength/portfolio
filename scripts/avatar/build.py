import cv2, numpy as np, json, sys
d = sys.argv[1]
C = np.load(d + '/classes.npy')
H, W = C.shape
yy, xx = np.mgrid[0:H, 0:W]

glasses = ((C == 7) | (C == 8)).astype(np.uint8)
glasses = cv2.morphologyEx(glasses, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(glasses)
glasses = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
# fill holes
ff = glasses.copy(); h2 = np.zeros((H + 2, W + 2), np.uint8); cv2.floodFill(ff, h2, (0, 0), 1)
glasses = glasses | (1 - ff)
lens = cv2.erode(glasses, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
lens[:, 334:356] = 0

head_classes = [1, 2, 3, 4, 5, 6, 9, 13]
Cf = C.copy()
Cf[glasses > 0] = 2  # face continues under the sunglasses
head = np.isin(Cf, head_classes)
shirt = np.isin(C, [10, 11, 12])
tuck = cv2.dilate(head.astype(np.uint8), np.ones((31, 31), np.uint8)) > 0
head_base = head | (tuck & shirt & (yy > 380))

def path(mask, eps=1.3, min_area=140):
    m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 2.4) > 0.5
    cs, hier = cv2.findContours(m.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if abs(cv2.contourArea(c)) < min_area: continue
        p = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(float)
        if len(p) < 3: continue
        # Catmull-Rom to cubic bezier
        n = len(p); s = f'M{p[0][0]:.0f} {p[0][1]:.0f}'
        for i in range(n):
            p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
            c1 = p1 + (p2 - p0) / 6; c2 = p2 - (p3 - p1) / 6
            s += f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.0f} {p2[1]:.0f}'
        out.append(s + 'Z')
    return ''.join(out)

# darkness order for stacking: light(1) < mid(2) < shadow(3) < dark(4) < black(5)
rank = {1: 0, 2: 1, 3: 2, 4: 3, 13: 4, 9: 5, 5: 6}
R = np.full(C.shape, -1); 
for k, r in rank.items(): R[Cf == k] = r
layers = {
  'shirt': path(shirt), 'shirtShade': path(np.isin(C, [11, 12])), 'shirtDeep': path(C == 12),
  'skin': path(head_base),
  'skinMid': path(R >= 1), 'skinShadow': path(R >= 2), 'beard': path(R >= 3), 'beardDeep': path(R >= 4), 'hairShine': path(R >= 5), 'hair': path(R >= 6),
  'frame': path(glasses > 0, eps=1.5), 'lens': path(lens > 0, eps=1.5),
}
json.dump(layers, open(d + '/layers.json', 'w'))
print({k: len(v) for k, v in layers.items()}, sum(len(v) for v in layers.values()))
ys, xs = np.where(lens > 0)
for half in (xs < 345, xs >= 345):
    print('lens', xs[half].min(), xs[half].max(), ys[half].min(), ys[half].max(), xs[half].mean().round(), ys[half].mean().round())
