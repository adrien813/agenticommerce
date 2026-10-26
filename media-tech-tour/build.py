from html.parser import HTMLParser
from pathlib import Path
import base64

class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            self.images.append(dict(attrs))

parser = Images()
parser.feed(Path('stripe-tech-for-retail/index.html').read_text())
assets = Path('media-tech-tour/assets')
assets.mkdir(exist_ok=True)
for index, image in enumerate(parser.images[:-1]):
    header, data = image['src'].split(',', 1)
    ext = header.split('/')[1].split(';')[0]
    (assets / f'asset-{index}.{ext}').write_bytes(base64.b64decode(data))
assert Path('media-tech-tour/index.html').stat().st_size > 10000
print('Media Tech Tour page and assets ready')
