"""Sync the latest public YouTube feed. Invalid responses never replace cached data."""
import json, os, re, time, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
CHANNEL = 'UC340AD-VMswvCvM6Qxu8HLQ'
TARGET = Path(__file__).resolve().parents[1] / 'data/youtube.json'
NS = {'a':'http://www.w3.org/2005/Atom','yt':'http://www.youtube.com/xml/schemas/2015'}
def parse(raw):
    root=ET.fromstring(raw)
    if root.findtext('yt:channelId',namespaces=NS)!=CHANNEL:
        raise ValueError('Unexpected channel')
    videos=[]
    for entry in root.findall('a:entry',NS):
        vid=entry.findtext('yt:videoId',namespaces=NS)
        title=entry.findtext('a:title',namespaces=NS)
        published=entry.findtext('a:published',namespaces=NS)
        if not vid or not re.fullmatch(r'[\w-]{11}',vid) or not title or not published:
            raise ValueError('Incomplete video data')
        datetime.fromisoformat(published.replace('Z','+00:00'))
        videos.append({'id':vid,'title':title,'published':published})
    if not videos: raise ValueError('Empty feed; keeping last successful snapshot')
    return sorted(videos,key=lambda x:x['published'],reverse=True)[:15]
def main():
    error=None
    for attempt in range(3):
        try:
            request=urllib.request.Request('https://www.youtube.com/feeds/videos.xml?channel_id='+CHANNEL,headers={'User-Agent':'YoupengxunWebsite/1.0'})
            with urllib.request.urlopen(request,timeout=25) as response: raw=response.read(2_000_001)
            if len(raw)>2_000_000:raise ValueError('Oversize feed')
            videos=parse(raw);break
        except Exception as exc:
            error=exc
            if attempt==2:raise RuntimeError('YouTube sync failed; previous data preserved') from error
            time.sleep(5*(attempt+1))
    old=json.loads(TARGET.read_text(encoding='utf-8')) if TARGET.exists() else {}
    # One daily heartbeat prevents dormant schedules; changed videos publish immediately.
    now=datetime.now(timezone.utc).isoformat()
    if old.get('videos')==videos and old.get('checkedAt','')[:10]==now[:10]:return
    data={'channelId':CHANNEL,'channelUrl':'https://www.youtube.com/@youpengxun','checkedAt':now,'videos':videos}
    TARGET.parent.mkdir(parents=True,exist_ok=True)
    temp=TARGET.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(temp,TARGET)
    print('Validated',len(videos),'videos')
if __name__=='__main__':main()
