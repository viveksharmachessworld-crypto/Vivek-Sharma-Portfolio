import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import parse from 'html-react-parser';
import markup from '../public/site.html?raw';
import certificatesSeed from './certificates.json';
import gameRecords from './games.json';
import SeoPage from './seo-pages.jsx';
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
function imageUrl(file) { return `/images/${encodeURIComponent(file||'')}`; }
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
      <button className="spotlight-main" onClick={()=>setSelected(active)} aria-label={`View ${certificates[active]?.caption||'certificate'} full size`}><img src={imageUrl(certificates[active]?.file)} alt={certificates[active]?.caption||'Chess certificate'} width={certificates[active]?.width} height={certificates[active]?.height}/><span>VIEW FULL CERTIFICATE ↗</span></button>
      <button className="spotlight-side next" onClick={()=>move(1)} aria-label="Next certificate"><img src={imageUrl(certificates[(active+1)%certificates.length]?.file)} alt=""/></button>
    </div>
    <div className="certificate-meta"><span>ARCHIVE RECORD&nbsp; {String(active+1).padStart(2,'0')} / {String(certificates.length).padStart(2,'0')}</span><b>{certificates[active]?.caption}</b><small>{certificates[active]?.detail}</small></div>
    <div className="certificate-controls"><button className="certificate-step" onClick={()=>move(-1)} aria-label="Previous certificates">←</button><span>{String(active+1).padStart(2,'0')} — {String(certificates.length).padStart(2,'0')}</span><button className="certificate-step" onClick={()=>move(1)} aria-label="Next certificates">→</button><span className="certificate-hint">SWIPE OR USE ARROWS TO EXPLORE</span></div>
    <div className="certificate-grid" ref={stage}>{certificates.map((cert,index)=><button key={cert.file} className={`certificate-card${index===active?' selected':''}`} style={{'--card-order':index}} onClick={()=>{setActive(index);setSelected(index);}} aria-label={`Open certificate ${index+1}: ${cert.caption}`}><span className="certificate-card-image"><img src={imageUrl(cert.file)} alt={cert.caption} width={cert.width} height={cert.height} loading="lazy"/></span><span className="certificate-card-copy"><small>{String(index+1).padStart(2,'0')} / CERTIFICATE</small><b>{cert.caption}</b></span></button>)}</div>
    {selected!==null&&<div className="certificate-modal" role="dialog" aria-modal="true" aria-label={certificates[selected].caption} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}><button className="certificate-modal-close" onClick={()=>setSelected(null)} aria-label="Close certificate viewer">×</button><button className="certificate-modal-step" onClick={()=>setSelected(i=>(i-1+certificates.length)%certificates.length)} aria-label="Previous certificate">←</button><figure><img src={imageUrl(certificates[selected].file)} alt={certificates[selected].caption}/><figcaption>{certificates[selected].caption} · {certificates[selected].detail}</figcaption></figure><button className="certificate-modal-step" onClick={()=>setSelected(i=>(i+1)%certificates.length)} aria-label="Next certificate">→</button></div>}
  </div>;
}
function GameArchive() {
  const [view,setView]=useState('all');
  const [selected,setSelected]=useState(gameRecords[0]);
  const visibleGames=view==='GM'||view==='IM'?gameRecords.filter(game=>game.group===view):gameRecords;
  const ranked=[...gameRecords].sort((a,b)=>b.opponentRating-a.opponentRating);
  const squares=Array.from({length:64},(_,index)=><span key={index} className={(Math.floor(index/8)+index%8)%2?'dark':''}/>);
  return <section className="games-section" id="games" aria-labelledby="games-title">
    <div className="section-kicker"><span>THE GAME ARCHIVE</span><span className="kicker-line"/><span>GM + IM OPPONENTS · 2022—23</span></div>
    <div className="games-intro"><div><p className="eyebrow gold-text">SIX RECORDS FROM THE BOARD</p><h2 id="games-title">Measured against<br/><em>the best.</em></h2></div><p>Rapid, blitz and classical encounters against titled opposition. Choose a record to see its tournament details and open the linked game source.</p></div>
    <div className="games-metrics"><div><strong>06</strong><span>ARCHIVED GAMES</span></div><div><strong>04</strong><span>GRANDMASTER OPPONENTS</span></div><div><strong>2527</strong><span>HIGHEST OPPONENT RATING</span></div><div className="games-note">Ratings shown are the opponent's event ratings in the supplied game archive.</div></div>
    <div className="game-explorer">
      <div className="game-art-panel">
        <div className="game-board-frame" aria-hidden="true"><div className="game-board3d">{squares}</div><span className="orbit-piece orbit-knight">♞</span><span className="orbit-piece orbit-rook">♜</span><span className="orbit-piece orbit-bishop">♝</span><span className="board-coordinate">8 · 1</span></div>
        <div className="game-art-caption"><span>THE OPPOSITION ARCHIVE</span><b>{String(selected.opponentRating).padStart(4,'0')} <small>{selected.opponentTitle}</small></b></div>
      </div>
      <div className="game-details-panel" aria-live="polite">
        <div className="game-filter" role="group" aria-label="Filter game archive"><button className={view==='all'?'active':''} onClick={()=>{setView('all');setSelected(gameRecords[0]);}}>ALL GAMES</button><button className={view==='GM'?'active':''} onClick={()=>{setView('GM');setSelected(gameRecords.find(game=>game.group==='GM'));}}>GM</button><button className={view==='IM'?'active':''} onClick={()=>{setView('IM');setSelected(gameRecords.find(game=>game.group==='IM'));}}>IM</button><button className={view==='opponents'?'active':''} onClick={()=>setView('opponents')}>TOP OPPONENTS</button></div>
        {view==='opponents'?<div className="opponent-rankings"><div className="opponent-table-head"><span>RANK</span><span>OPPONENT</span><span>RATING</span></div>{ranked.map((game,index)=><button className="opponent-row" key={game.id} onClick={()=>{setSelected(game);setView('all');}}><span>{String(index+1).padStart(2,'0')}</span><b>{game.opponent}<small>{game.opponentTitle} · {game.year}</small></b><strong>{game.opponentRating}</strong></button>)}</div>:<>
          <div className="game-picker">{visibleGames.map(game=><button key={game.id} className={`game-picker-card${selected.id===game.id?' selected':''}`} onClick={()=>setSelected(game)}><span>{game.title}</span><b>{game.opponent}</b><small>{game.opponentTitle} · {game.opponentRating} · {game.format}</small></button>)}</div>
          <article className="selected-game"><div className="selected-game-kicker"><span>{selected.title}</span><span>{selected.format} · {selected.year}</span></div><h3>{selected.opponentTitle} {selected.opponent}</h3><div className="game-matchup"><span>{selected.opponentRating} <small>{selected.opponentTitle}</small></span><i>VS</i><span>{selected.vivekRating} <small>VIVEK SHARMA</small></span></div><div className="game-info-grid"><div><small>TOURNAMENT</small><b>{selected.event}</b></div><div><small>DATE / ROUND</small><b>{selected.date}{selected.round?` · ${selected.round}`:''}{selected.board?` · ${selected.board}`:''}</b></div><div><small>RESULT</small><b>{selected.result} <em>· {selected.outcome} for Vivek</em></b></div><div><small>OPENING / ECO</small><b>{selected.opening}{selected.eco?` · ${selected.eco}`:''}</b></div></div><a className="game-source-link" href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel} <span>↗</span></a></article>
        </>}
      </div>
    </div>
    <p className="game-source-note">Game details and event ratings follow the supplied archive; linked databases provide the source records. The Diptayan Ghosh game links directly to its complete ChessBox score.</p>
  </section>;
}
function HomeApp() {
  useEffect(()=>{
    import('../script.js');
    const revealTargets=document.querySelectorAll('.intro-section,.feature-section,.games-section,.career-results,.ratings-section,.press-section,.disciplines-section,.identity-section,.closing-section');
    revealTargets.forEach(target=>target.classList.add('scroll-reveal'));
    if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');revealObserver.unobserve(entry.target);}}),{threshold:.08});revealTargets.forEach(target=>revealObserver.observe(target));}else revealTargets.forEach(target=>target.classList.add('in-view'));
  },[]);
  const content=parse(markup,{replace:node=>{
    if(node.type!=='tag')return;
    if(node.attribs?.id==='sound-control')return <SoundControl/>;
    if(node.attribs?.id==='certificate-app')return <CertificateGallery/>;
    if(node.attribs?.id==='games-app')return <GameArchive/>;
  }});
  return <>{content}</>;
}
const root=createRoot(document.getElementById('root'));
if(window.location.pathname==='/'||window.location.pathname==='/index.html')root.render(<HomeApp/>);
else root.render(<SeoPage path={window.location.pathname}/>);
