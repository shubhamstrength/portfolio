import cv2, numpy as np, sys
src = sys.argv[1]; out = sys.argv[2]
img = cv2.imread(src)[:, :, :3]
# crop to head and shoulders
x0, y0, x1, y1 = 150, 50, 930, 836
crop = img[y0:y1, x0:x1].copy()
h, w = crop.shape[:2]
mask = np.zeros((h, w), np.uint8)
rect = (20, 10, w - 40, h - 10)
bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(crop, mask, rect, bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
# keep largest component, fill holes
n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
m = np.where(lab == big, 255, 0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
cv2.imwrite(out + '/crop.png', crop)
cv2.imwrite(out + '/mask.png', m)
viz = crop.copy(); viz[m == 0] = (40, 40, 40)
cv2.imwrite(out + '/cut.png', viz)
