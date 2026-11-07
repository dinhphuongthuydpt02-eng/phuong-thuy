/* Nội dung được chỉnh tại https://app.pagescms.org/ và lưu trong data/*.json. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const setText = (selector, value) => { if (typeof value === 'string' && $(selector)) $(selector).textContent = value; };
  const setImg = (selector, value) => { if (value && $(selector)) $(selector).src = value; };
  const safeLink = (str) => {
    if (!str || typeof str !== 'string') return '#contact';
    if (/^#[a-z0-9_-]+$/i.test(str) || /^\/(?!\/)[^\s]*$/.test(str) || /^https?:\/\//i.test(str)) return str;
    return '#contact';
  };
  const elem = (tag, className, text) => { const n = document.createElement(tag); if(className)n.className=className;if(text!==undefined)n.textContent=String(text);return n; };
  const replaceChildren = (root, children) => { if (root) root.replaceChildren(...children); };
  const request = async (path) => {
    const response = await fetch(path, {cache:'no-store'});
    if (!response.ok) throw new Error('Không tải được '+path);
    return response.json();
  };
  function renderSite(s) {
    if (!s || typeof s !== 'object') return;
    setText('.brand',s.brand);
    setText('.hero .eyebrow',s.tagline);
    const h1=$('.hero h1');
    if(h1 && [s.headline1,s.headline2,s.headline3].every(x=>typeof x==='string')) {
      const accent=elem('span','',s.headline3);accent.style.color='var(--gold)';
      h1.replaceChildren(document.createTextNode(s.headline1),document.createElement('br'),document.createTextNode(s.headline2),document.createElement('br'),accent);
    }
    setText('.hero .lead',s.intro);
    setImg('.hero-photo img',s.hero_image);
    setText('.numbers',undefined);
    const statHead=$('.dark[aria-label] > .wrap:first-child > div');
    if(statHead && typeof s.stats_heading==='string') statHead.textContent=s.stats_heading;
    if(Array.isArray(s.stats)) replaceChildren($('.numbers'),s.stats.map(item=>{
      const card=elem('div','stat');card.append(elem('div','num',item.value||''),elem('div','stat-label',item.label||''));return card;
    }));
    const statNotes=$$('.numbers')[0]?.nextElementSibling;
    if(statNotes){const ps=$$('p',statNotes);if(ps[0]&&s.stats_note)ps[0].textContent=s.stats_note;if(ps[1]&&s.stats_source)ps[1].textContent=s.stats_source;}
    setText('.about h2',s.about_heading);
    const aboutParagraphs=$$('.about p');
    if(aboutParagraphs[0])aboutParagraphs[0].textContent=s.about_paragraph1||'';
    if(aboutParagraphs[1])aboutParagraphs[1].textContent=s.about_paragraph2||'';
    setImg('.about-photo',s.about_image);
    setImg('.story > img',s.story_image);
    if(Array.isArray(s.skills)) replaceChildren($('.expertise'),s.skills.map((sk,i)=>{
      const card=elem('article','expert');
      card.append(elem('span','index',String(i+1).padStart(2,'0')+' - EXPERTISE'),elem('h3','',sk.title||''),elem('p','',sk.description||''));return card;
    }));
    if(Array.isArray(s.experience)) replaceChildren($('.timeline'),s.experience.map(it=>{
      const card=elem('div','event');card.append(elem('small','',it.period||''),elem('h3','',it.title||''),elem('p','',it.description||''));return card;
    }));
    setText('.contact .big',s.contact_heading);
    setText('.contact .dim',s.contact_description);
    const email=String(s.email||'');const emailHref='mailto:'+encodeURIComponent(email);
    const phone=String(s.phone||'');
    const contactInfo=$('.contact-info');
    if(contactInfo){const anchors=$$('a',contactInfo);if(anchors[0]){anchors[0].textContent=email;anchors[0].href=emailHref;}if(anchors[1]){anchors[1].textContent=phone;anchors[1].href='tel:'+phone.replace(/[^0-9+]/g,'');}if(anchors[2]){anchors[2].textContent=s.location||'';}}
    const mailAnchors=$$('a[href^="mailto:"]');mailAnchors.forEach(a=>{a.href=emailHref+(a.closest('.contact')?'?subject='+encodeURIComponent('Hợp tác cùng Phương Thùy'):'');});
    const linkedIn=$('.contact a[href*="linkedin.com"]');if(linkedIn)linkedIn.href=safeLink(s.linkedin);
  }
  function projectCard(p) {
    const card=elem('article','project');card.dataset.kind=['seo','social','ai'].includes(p.category)?p.category:'social';
    const visual=elem('div','visual');const img=elem('img');img.loading='lazy';img.alt=p.title||'Hình ảnh dự án';img.src=p.image||'/assets/creative.webp';visual.append(img);
    const info=elem('div','info');info.append(elem('small','',p.tag||'Dự án'),elem('h3','',p.title||'Chưa đặt tên'),elem('p','',p.description||''));
    if(p.link){const a=elem('a','textlink',(p.link_label||'Xem chi tiết')+' ↗');a.href=safeLink(p.link);if(/^https?:\/\//i.test(a.href)){a.target='_blank';a.rel='noopener noreferrer';}info.append(a);}
    card.append(visual,info);return card;
  }
  function applyFilter() {
    const current=$('.work-tabs .tab.active')?.dataset.filter||'all';
    $$('.project').forEach(card=>card.classList.toggle('hidden',current!=='all'&&card.dataset.kind!==current));
  }
  function renderProjects(items) {
    if (!Array.isArray(items))return;
    replaceChildren($('.projects'),items.filter(p=>p.published!==false).map(projectCard));applyFilter();
  }
  function youtubeId(raw) {
    try {
      const u=new URL(raw);
      if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com'].includes(u.hostname)){
        if(u.pathname==='/watch')return u.searchParams.get('v');
        const match=u.pathname.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/);if(match)return match[1];
      }
      if(u.hostname==='youtu.be')return u.pathname.slice(1).split('/')[0];
    }catch(e){}
    return null;
  }
  function videoCard(v) {
    const card=elem('article','video-card');const media=v.video_file||v.video_url||'';const id=youtubeId(media);
    if(id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      const frame=elem('iframe');frame.title=v.title||'YouTube video';frame.src='https://www.youtube-nocookie.com/embed/'+id;frame.loading='lazy';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.style.cssText='display:block;width:100%;aspect-ratio:9/16;border:0;background:#0d1521';card.append(frame);
    }else {
      const video=elem('video');video.controls=true;video.playsInline=true;video.preload='none';video.poster=v.poster||'';video.setAttribute('aria-label',v.title||'Video dự án');
      const source=elem('source');source.src=safeLink(media);source.type=/\.webm(?:$|\?)/i.test(media)?'video/webm':'video/mp4';video.append(source,'Trình duyệt không hỗ trợ video.');card.append(video);
    }
    const info=elem('div','info');info.append(elem('h3','',v.title||'Video'),elem('p','',v.subtitle||''));card.append(info);return card;
  }
  function renderVideos(items) {
    if (!Array.isArray(items))return;
    replaceChildren($('.video-grid'),items.filter(v=>v.published!==false&&(v.video_file||v.video_url)).map(videoCard));
  }
  $$('.work-tabs .tab').forEach(b=>b.addEventListener('click',()=>{
    $$('.work-tabs .tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false');});b.classList.add('active');b.setAttribute('aria-pressed','true');applyFilter();
  }));
  // Khi xem file HTML bằng file://, trình duyệt thường chặn fetch; giao diện mẫu trong HTML vẫn hiển thị.
  Promise.allSettled([request('/data/site.json'),request('/data/projects.json'),request('/data/videos.json')]).then(results=>{
    const operations=[renderSite,renderProjects,renderVideos];
    results.forEach((r,i)=>{if(r.status==='fulfilled'){try{operations[i](r.value)}catch(error){console.warn('Lỗi hiển thị nội dung',error);}}else console.warn('Chưa tải được phần quản trị: ',r.reason);});
  });
})();
