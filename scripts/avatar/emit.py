import json, sys
L = json.load(open(sys.argv[1] + '/layers.json'))
out = sys.argv[2]
def block(keys):
    return ''.join(f"  {k}: '{L[k]}',\n" for k in keys)
src = f"""// Generated from a photo: background removed, posterised into flat tones, then traced.
// Coordinates are in the cropped photo's pixel space (780 x 786).

export const shirt = {{
{block(['shirt', 'shirtShade', 'shirtDeep'])}}}

export const head = {{
{block(['skin', 'skinMid', 'skinShadow', 'beard', 'beardDeep', 'hairShine', 'hair'])}}}

export const glasses = {{
{block(['frame', 'lens'])}}}
"""
open(out, 'w').write(src)
