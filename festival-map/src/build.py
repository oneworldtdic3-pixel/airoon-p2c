import base64, sys
d = sys.argv[1]
t = open(f'{d}/' + (sys.argv[3] if len(sys.argv) > 3 else 'template2.html')).read()
b64 = lambda f: 'data:image/jpeg;base64,' + base64.b64encode(open(f'{d}/{f}', 'rb').read()).decode()
out = t.replace('__ZONES__', open(f'{d}/zones.json').read()).replace('__STAGE__', b64('stage.jpg')).replace('__PARCEL__', b64('parcel.jpg'))
open(sys.argv[2], 'w').write(out)
