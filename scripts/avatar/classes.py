import cv2, numpy as np, sys
d = sys.argv[1]
crop = cv2.imread(d + '/crop.png'); m = cv2.imread(d + '/mask.png', 0)
b_, g_, r_ = [crop[:, :, i].astype(int) for i in range(3)]
m[(b_ > 170) & (b_ - r_ > 40) & (g_ > 120)] = 0
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
n, lab_, st, _ = cv2.connectedComponentsWithStats(m)
m = np.where(lab_ == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
sm = cv2.pyrMeanShiftFiltering(crop, 10, 24)
sm = cv2.bilateralFilter(sm, 9, 50, 9)
lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).astype(int)
L = lab[:, :, 0] * 100 // 255; A = lab[:, :, 1] - 128; B = lab[:, :, 2] - 128
H, W = m.shape
yy, xx = np.mgrid[0:H, 0:W]
fg = m > 0
chroma = np.hypot(A, B)
shirt = fg & (yy > 390) & ((chroma < 14) | (B < 0)) & (L > 55)
shirt = cv2.morphologyEx(shirt.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > 0
# keep shirt components touching the bottom
n, cl, st, _ = cv2.connectedComponentsWithStats(shirt.astype(np.uint8))
keep = np.zeros_like(shirt)
for i in range(1, n):
    if st[i, cv2.CC_STAT_TOP] + st[i, cv2.CC_STAT_HEIGHT] >= H - 5 or st[i, cv2.CC_STAT_AREA] > 4000:
        keep |= cl == i
shirt = keep & fg
head = fg & ~shirt
C = np.zeros((H, W), np.uint8)  # class ids
# 1 skin light, 2 skin mid, 3 skin shadow, 4 dark (beard), 5 black (hair), 6 teeth, 7 frame, 8 lens, 10 shirt, 11 shirt shade, 12 shirt deep
C[head & (L >= 72)] = 1
C[head & (L >= 58) & (L < 72)] = 2
C[head & (L >= 40) & (L < 58)] = 3
C[head & (L >= 22) & (L < 40)] = 4
C[head & (L < 22)] = 5
# below the hairline the darkest tones are beard, not hair
C[head & (L < 22) & (yy > 300)] = 13
# hair highlights become a separate soft tone so the quiff reads as one mass
C[head & (C == 4) & (yy < 205)] = 9
gl = (yy > 195) & (yy < 310) & (xx > 220) & (xx < 485)
C[head & gl & (B < -6) & (L < 45)] = 7
C[head & gl & (L < 30) & (yy > 215) & (yy < 300) & (xx > 235) & (xx < 470)] = 8
mouth = (yy > 325) & (yy < 360) & (xx > 290) & (xx < 400)
C[head & mouth & (L > 66) & (chroma < 24) & (A < 14)] = 6
C[shirt] = 10
C[shirt & (L < 91)] = 11
C[shirt & (L < 80)] = 12
# smooth labels
C = cv2.medianBlur(C, 7)
C[~fg] = 0
np.save(d + '/classes.npy', C)
pal = {13:(42,28,26),9:(46,40,48),1:(236,190,165),2:(206,148,120),3:(160,100,80),4:(70,46,42),5:(22,20,26),6:(250,244,236),7:(38,52,120),8:(14,18,34),10:(244,242,236),11:(214,214,222),12:(180,182,196)}
viz = np.full((H, W, 3), 40, np.uint8)
for k, c in pal.items(): viz[C == k] = c[::-1]
cv2.imwrite(d + '/classes_viz.png', viz)
