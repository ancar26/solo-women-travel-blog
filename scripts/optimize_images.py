#!/usr/bin/env python3
"""Optimize website images in place: auto-orient, resize, re-encode, strip metadata.
Keeps the same file path/extension so existing HTML <img src> keeps working.
"""
import os, sys
from PIL import Image, ImageOps

ROOT = sys.argv[1] if len(sys.argv) > 1 else "images"
MAX_SIDE = 1600        # longest edge in px
JPEG_QUALITY = 82      # visually lossless-ish for web
exts = (".jpg", ".jpeg", ".png")

total_before = total_after = 0
n_done = n_resized = n_skip = 0

for dirpath, _, files in os.walk(ROOT):
    for name in files:
        if not name.lower().endswith(exts):
            continue
        path = os.path.join(dirpath, name)
        try:
            before = os.path.getsize(path)
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im)   # bake in phone rotation
                w, h = im.size
                resized = False
                if max(w, h) > MAX_SIDE:
                    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                    resized = True
                ext = os.path.splitext(name)[1].lower()
                if ext in (".jpg", ".jpeg"):
                    if im.mode in ("RGBA", "P", "LA"):
                        im = im.convert("RGB")
                    im.save(path, "JPEG", quality=JPEG_QUALITY,
                            optimize=True, progressive=True)
                else:  # .png
                    im.save(path, "PNG", optimize=True)
            after = os.path.getsize(path)
            total_before += before
            total_after += after
            n_done += 1
            if resized:
                n_resized += 1
        except Exception as e:
            print(f"  SKIP {path}: {e}")
            n_skip += 1

mb = 1024 * 1024
print(f"\nProcessed: {n_done} images  (resized {n_resized}, errors {n_skip})")
print(f"Before: {total_before/mb:6.1f} MB")
print(f"After:  {total_after/mb:6.1f} MB")
if total_before:
    print(f"Saved:  {(total_before-total_after)/mb:6.1f} MB "
          f"({100*(total_before-total_after)/total_before:.0f}% smaller)")
