# Avatar tracing

Regenerates `src/components/avatar/portrait.ts` from a photo. Needs Python with `opencv-python-headless` and `numpy`.

```sh
python seg.py photo.png out      # crop to head and shoulders, cut out the background
python classes.py out            # posterise into skin, beard, hair, sunglasses and shirt tones
python build.py out              # trace each tone into smooth SVG paths
python emit.py out ../../src/components/avatar/portrait.ts
```

The crop box in `seg.py` and the sunglasses and mouth regions in `classes.py` are tuned to the current photo.
