import zipfile,re,sys
from xml.etree import ElementTree as ET
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
def blocks(path):
    z=zipfile.ZipFile(path); root=ET.fromstring(z.read('word/document.xml'))
    body=root.find(W+'body')
    out=[]
    for el in body:
        if el.tag==W+'p':
            t=''.join(x.text or '' for x in el.iter(W+'t')).strip()
            st=el.find(f'{W}pPr/{W}pStyle'); style=st.get(W+'val') if st is not None else ''
            if t: out.append(('p',style,t))
        elif el.tag==W+'tbl':
            rows=[]
            for tr in el.iter(W+'tr'):
                cells=[]
                for tc in tr.findall(W+'tc'):
                    cells.append(' / '.join(''.join(x.text or '' for x in p.iter(W+'t')).strip() for p in tc.iter(W+'p') if ''.join(x.text or '' for x in p.iter(W+'t')).strip()))
                rows.append(cells)
            out.append(('t','',rows))
    return out
if __name__=='__main__':
    for kind,style,t in blocks(sys.argv[1]):
        if kind=='p': print(f'[{style}] {t}')
        else:
            for r in t: print('  | '+' || '.join(r))
