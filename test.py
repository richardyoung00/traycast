import time
import pychromecast

chromecasts = pychromecast.get_chromecasts()

for c in chromecasts:
    c.wait()
    print(c.media_controller.status)
