import json, sys
d=json.load(open(sys.argv[1]))
meta=[
 dict(id='temple',name='쌍계사 내부 텐트존',size='9m × 50m',tents=30,emu_m=180000,entry=180),
 dict(id='school',name='쌍계초등학교',size='30m × 60m',tents=85,emu_m=180000,entry=180),
 dict(id='parking',name='주차장 · 언덕 사이트',size='약 50m × 51m (실측)',tents=135,emu_m=110000,entry=-50.5),
]
arrows=[(10108363,2059229,701964,1005275),(11305268,1577629,701964,1005275),(152902,5069181,860185,1005275)]
# slide 3 has one group (4 tents beside 템플스테이) rotated 270deg; python-pptx reports child coords only.
GROUP_CHILDREN={'직사각형 321','직사각형 323','직사각형 325','직사각형 327'}
G=dict(ox=10219617,oy=2511423,cx=1318539,cy=439513,chx=7329538,chy=5409720,chw=1698527)
def ungroup(s):
    k=G['cx']/G['chw']
    x=G['ox']+(s['x']-G['chx'])*k; y=G['oy']+(s['y']-G['chy'])*k; w=s['w']*k; h=s['h']*k
    gx=G['ox']+G['cx']/2; gy=G['oy']+G['cy']/2
    dx=x+w/2-gx; dy=y+h/2-gy
    nx,ny=gx+dy,gy-dx  # 270deg clockwise
    return {**s,'x':nx-h/2,'y':ny-w/2,'w':h,'h':w}
out=[]
for i,sl in enumerate(d):
    m=meta[i]; items=[]
    for s in sl:
        if i==2 and s['name'] in GROUP_CHILDREN: s=ungroup(s)
        t=s['text'].strip()
        if s['geom'] and 'ARROW' in s['geom']: continue
        if s['geom'] is None and t:
            if '언덕' in t: items.append(dict(k='label',x=s['x'],y=s['y'],w=s['w'],h=s['h'],t=t))
            continue
        if t: items.append(dict(k='fac',x=s['x'],y=s['y'],w=s['w'],h=s['h'],t=t))
        elif s['w']>2000000: items.append(dict(k='ground',x=s['x'],y=s['y'],w=s['w'],h=s['h']))
        else: items.append(dict(k='tent',x=s['x'],y=s['y'],w=s['w'],h=s['h']))
    ax,ay,aw,ah=arrows[i]
    m['entryPt']=[ax+aw/2,ay+ah/2]
    assert sum(1 for x in items if x['k']=='tent')==m['tents'], (i, sum(1 for x in items if x['k']=='tent'))
    xs=[x['x'] for x in items]+[ax]; ys=[x['y'] for x in items]+[ay]
    xe=[x['x']+x['w'] for x in items]+[ax+aw]; ye=[x['y']+x['h'] for x in items]+[ay+ah]
    m['bbox']=[min(xs),min(ys),max(xe)-min(xs),max(ye)-min(ys)]
    m['items']=[{**x,**{k:round(x[k]) for k in 'xywh'}} for x in items]
    out.append(m)
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,separators=(',',':'))
print([ (m['id'],m['tents'],len(m['items'])) for m in out])
