import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import parse from 'html-react-parser';
import markup from '../public/site.html?raw';
import certificatesSeed from './certificates.json';
import './styles.css';

function SoundControl() {
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);
  useEffect(() => () => { audio.current?.ctx.close(); }, []);
  const toggle = async () => {
    if (playing) { const activeAudio=audio.current; activeAudio?.master.gain.setTargetAtTime(0, activeAudio.ctx.currentTime, .35); setTimeout(()=>activeAudio?.ctx.close(),900); audio.current=null; setPlaying(false); return; }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx(); await ctx.resume();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 620; filter.connect(master);
    [130.81,164.81,196,261.63].forEach((hz,i) => { const osc=ctx.createOscillator(), gain=ctx.createGain(); osc.type=i===3?'triangle':'sine'; osc.frequency.value=hz; gain.gain.value=i===3?.11:.18; osc.connect(gain); gain.connect(filter); osc.start(); });
    audio.current={ctx,master}; master.gain.setTargetAtTime(.14,ctx.currentTime,1.2); setPlaying(true);
  };
  return <button className={`sound-toggle${playing?' is-playing':''}`} type="button" aria-pressed={playing} onClick={toggle} aria-label={playing?'Turn ambient music off':'Turn ambient music on'}><span className="sound-bars" aria-hidden="true"><i/><i/><i/></span><span className="sound-label">{playing?'SOUND ON':'SOUND OFF'}</span></button>;
}
function imageUrl(file) { return `/My%20Portfolio%20Image/${encodeURIComponent(file||'')}`; }
function CertificateGallery() {
  const [certificates,setCertificates]=useState(certificatesSeed), [active,setActive]=useState(0), [selected,setSelected]=useState(null);
  const stage=useRef(null), touch=useRef(null);
  useEffect(()=>{fetch('/api/certificates').then(r=>r.ok?r.json():[]).then(data=>{if(data.length)setCertificates(data);}).catch(()=>{});},[]);
  useEffect(()=>{
    if(!stage.current||!('IntersectionObserver'in window)){stage.current?.querySelectorAll('.certificate-card').forEach(c=>c.classList.add('is-visible'));return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12});
    stage.current.querySelectorAll('.certificate-card').forEach(c=>observer.observe(c));return()=>observer.disconnect();
  },[certificates]);
  const move=amount=>setActive(i=>(i+amount+certificates.length)%certificates.length);
  useEffect(()=>{if(selected===null)return;const key=e=>{if(e.key==='Escape')setSelected(null);if(e.key==='ArrowRight')setSelected(i=>(i+1)%certificates.length);if(e.key==='ArrowLeft')setSelected(i=>(i-1+certificates.length)%certificates.length);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[selected,certificates.length]);
  return <div className="certificate-gallery">
    <div className="certificate-spotlight" aria-live="polite" onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null&&Math.abs(e.changedTouches[0].clientX-touch.current)>45)move(e.changedTouches[0].clientX<touch.current?1:-1);touch.current=null;}}>
      <button className="spotlight-side previous" onClick={()=>move(-1)} aria-label="Previous certificate"><img src={imageUrl(certificates[(active-1+certificates.length)%certificates.length]?.file)} alt=""/></button>
      <button className="spotlight-main" onClick={()=>setSelected(active)} aria-label={`View ${certificates[active]?.caption||'certificate'} full size`}><img src={imageUrl(certificates[active]?.file)} alt={certificates[active]?.caption||'Chess certificate'}/><span>VIEW FULL CERTIFICATE ↗</span></button>
      <button className="spotlight-side next" onClick={()=>move(1)} aria-label="Next certificate"><img src={imageUrl(certificates[(active+1)%certificates.length]?.file)} alt=""/></button>
    </div>
    <div className="certificate-meta"><span>ARCHIVE RECORD&nbsp; {String(active+1).padStart(2,'0')} / {String(certificates.length).padStart(2,'0')}</span><b>{certificates[active]?.caption}</b><small>{certificates[active]?.detail}</small></div>
    <div className="certificate-controls"><button className="certificate-step" onClick={()=>move(-1)} aria-label="Previous certificates">←</button><span>{String(active+1).padStart(2,'0')} — {String(certificates.length).padStart(2,'0')}</span><button className="certificate-step" onClick={()=>move(1)} aria-label="Next certificates">→</button><span className="certificate-hint">SWIPE OR USE ARROWS TO EXPLORE</span></div>
    <div className="certificate-grid" ref={stage}>{certificates.map((cert,index)=><button key={cert.file} className={`certificate-card${index===active?' selected':''}`} style={{'--card-order':index}} onClick={()=>{setActive(index);setSelected(index);}} aria-label={`Open certificate ${index+1}: ${cert.caption}`}><span className="certificate-card-image"><img src={imageUrl(cert.file)} alt={cert.caption} loading="lazy"/></span><span className="certificate-card-copy"><small>{String(index+1).padStart(2,'0')} / CERTIFICATE</small><b>{cert.caption}</b></span></button>)}</div>
    {selected!==null&&<div className="certificate-modal" role="dialog" aria-modal="true" aria-label={certificates[selected].caption} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}><button className="certificate-modal-close" onClick={()=>setSelected(null)} aria-label="Close certificate viewer">×</button><button className="certificate-modal-step" onClick={()=>setSelected(i=>(i-1+certificates.length)%certificates.length)} aria-label="Previous certificate">←</button><figure><img src={imageUrl(certificates[selected].file)} alt={certificates[selected].caption}/><figcaption>{certificates[selected].caption} · {certificates[selected].detail}</figcaption></figure><button className="certificate-modal-step" onClick={()=>setSelected(i=>(i+1)%certificates.length)} aria-label="Next certificate">→</button></div>}
  </div>;
}
function App() {
  useEffect(()=>{
    import('../script.js');
    const revealTargets=document.querySelectorAll('.intro-section,.feature-section,.career-results,.ratings-section,.press-section,.disciplines-section,.identity-section,.closing-section');
    revealTargets.forEach(target=>target.classList.add('scroll-reveal'));
    if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');revealObserver.unobserve(entry.target);}}),{threshold:.08});revealTargets.forEach(target=>revealObserver.observe(target));}else revealTargets.forEach(target=>target.classList.add('in-view'));
  },[]);
  const content=parse(markup,{replace:node=>{
    if(node.type!=='tag')return;
    if(node.attribs?.id==='sound-control')return <SoundControl/>;
    if(node.attribs?.id==='certificate-app')return <CertificateGallery/>;
  }});
  return <>{content}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
