import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chess } from 'chess.js';
import parse from 'html-react-parser';
import markup from '../public/site.html?raw';
import certificatesSeed from './certificates.json';
import gameRecords from './games.json';
import SeoPage from './seo-pages.jsx';
import PortfolioAssistant from './portfolio-assistant.jsx';
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
const archiveCertificates = certificatesSeed.filter(cert => cert.showcase !== false);
const featuredCertificates = certificatesSeed.filter(cert => cert.showcaseLevel && cert.showcase !== false).sort((a,b) => (a.year||0)-(b.year||0));
function NationalCertificateShowcase() {
  const [active,setActive]=useState(0), touch=useRef(null);
  const certificates=featuredCertificates;
  const cert=certificates[active];
  if(!cert)return null;
  const move=amount=>setActive(i=>(i+amount+certificates.length)%certificates.length);
  const outcome=cert.detail.match(/\d+(?:st|nd|rd|th) place/i)?.[0]||cert.detail.match(/\d+(?:½|\.\d+)?\s*\/\s*\d+/i)?.[0]||'Participation';
  return <section className="feature-section national-certificate-feature" aria-label="National and open tournament certificate records">
    <div className="feature-image national-certificate-image" onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null&&Math.abs(e.changedTouches[0].clientX-touch.current)>45)move(e.changedTouches[0].clientX<touch.current?1:-1);touch.current=null;}}>
      <img className="certificate-slide-image" key={cert.file} src={imageUrl(cert.file)} alt={`${cert.year} ${cert.event} certificate`} width={cert.width} height={cert.height} loading="eager"/>
      <span className="image-tag">{cert.showcaseLevel.toUpperCase()} · {cert.year}</span>
    </div>
    <div className="feature-copy">
      <p className="eyebrow gold-text" aria-live="polite">{cert.showcaseLevel.toUpperCase()} CERTIFICATE · {String(active+1).padStart(2,'0')} / {String(certificates.length).padStart(2,'0')}</p>
      <h2 key={cert.file} className="certificate-slide-title">{outcome!=='Participation'?<>{outcome}.<br/><em>{cert.year}.</em></>:<>National stage.<br/><em>{cert.year}.</em></>}</h2>
      <p className="feature-name">{cert.event}<br/><span className="feature-format">{cert.showcaseLevel.toUpperCase()} · OWNER-PROVIDED CERTIFICATE</span></p>
      <div className="feature-stats"><div><strong>{cert.year}</strong><small>EVENT YEAR</small></div><div><strong>{cert.showcaseLevel}</strong><small>COMPETITION LEVEL</small></div><div><strong>{outcome}</strong><small>ON THE CERTIFICATE</small></div></div>
      <p className="feature-note">{cert.detail}. Each certificate in this collection is shown individually; use the controls to move through the archive.</p>
      <a className="text-link gold-link" href={imageUrl(cert.file)} target="_blank" rel="noreferrer">View full certificate <span>↗</span></a>
      <div className="national-certificate-controls" aria-label="Certificate navigation"><button className="certificate-step" type="button" onClick={()=>move(-1)} aria-label="Previous national certificate">←</button><span>{String(active+1).padStart(2,'0')} — {String(certificates.length).padStart(2,'0')}</span><button className="certificate-step" type="button" onClick={()=>move(1)} aria-label="Next national certificate">→</button><small>SWIPE OR USE ARROWS</small></div>
    </div>
  </section>;
}
function CertificateGallery() {
  const [certificates,setCertificates]=useState(archiveCertificates), [active,setActive]=useState(0), [selected,setSelected]=useState(null);
  const stage=useRef(null), touch=useRef(null);
  useEffect(()=>{fetch('/api/certificates').then(r=>r.ok?r.json():[]).then(data=>{const visible=data.filter(cert=>cert.showcase!==false);if(visible.length)setCertificates(visible);}).catch(()=>{});},[]);
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
const fischerPetrosianFen = 'Q7/4q3/2pq4/4p3/2PpP1P1/1knP4/7Q/5BK1 w - - 0 1';
const chessGlyphs = { wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙', bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟' };
function FischerPuzzle() {
  const [fen,setFen]=useState(fischerPetrosianFen), [selected,setSelected]=useState(null), [solved,setSolved]=useState(false), [message,setMessage]=useState('White to move · find the most practical winning try.'), [hint,setHint]=useState(false);
  const reset=()=>{setFen(fischerPetrosianFen);setSelected(null);setSolved(false);setHint(false);setMessage('White to move · find the most practical winning try.');};
  const play=(from,to)=>{
    if(solved)return;
    const game=new Chess(fen);
    let move;
    try { move=game.move({from,to,promotion:'q'}); } catch { move=null; }
    if(!move)return;
    setSelected(null);
    if(move.from==='c4'&&move.to==='c5'){
      setFen(game.fen());setSolved(true);setMessage('Congratulations — 1. c5! advances the passed pawn and gives White the strongest practical chances.');
    }else{
      setMessage('Legal move, but there is a more ambitious plan. Try again.');
      setFen(fischerPetrosianFen);
    }
  };
  const position=new Chess(fen), board=position.board();
  const squares=board.flatMap((rank,row)=>rank.map((piece,col)=>{
    const square=`${'abcdefgh'[col]}${8-row}`, dark=(row+col)%2===1, isSelected=selected===square;
    const legal=selected?(()=>{try{return new Chess(fen).moves({square:selected,verbose:true}).some(move=>move.to===square);}catch{return false;}})():false;
    const name=piece?`${piece.color==='w'?'white':'black'} ${({k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'})[piece.type]}`:'empty';
    return <button key={square} type="button" role="gridcell" className={`puzzle-square${dark?' dark':''}${isSelected?' is-selected':''}${legal?' is-legal':''}`} aria-label={`${square}, ${name}`} aria-selected={isSelected} draggable={Boolean(piece?.color==='w'&&!solved)} onClick={()=>{if(selected){if(selected===square){setSelected(null);return;}play(selected,square);}else if(piece?.color==='w'&&!solved)setSelected(square);}} onDragStart={event=>{if(piece?.color!=='w'||solved){event.preventDefault();return;}event.dataTransfer.setData('text/plain',square);setSelected(square);}} onDragOver={event=>{if(selected)event.preventDefault();}} onDrop={event=>{event.preventDefault();const from=event.dataTransfer.getData('text/plain')||selected;if(from)play(from,square);}}>{piece&&<span className={`puzzle-piece ${piece.color==='w'?'white':'black'}`} aria-hidden="true">{chessGlyphs[`${piece.color}${piece.type}`]}</span>}{col===0&&<small className="puzzle-coordinate rank-coordinate">{8-row}</small>}{row===7&&<small className="puzzle-coordinate file-coordinate">{'abcdefgh'[col]}</small>}</button>;
  }));
  return <div className="fischer-puzzle">
    <div className="puzzle-heading"><span>POSITION 01 · WHITE TO MOVE</span><button type="button" onClick={reset} aria-label="Reset chess puzzle">RESET ↺</button></div>
    <div className="puzzle-board" role="grid" aria-label="Playable Fischer versus Petrosian chess puzzle" onDragOver={event=>event.preventDefault()}>{squares}</div>
    <div className={`puzzle-message${solved?' solved':''}`} aria-live="polite"><i aria-hidden="true">{solved?'✦':'●'}</i>{message}</div>
    <div className="puzzle-controls"><button type="button" onClick={()=>setHint(true)} disabled={hint||solved}>HINT</button><span>{hint?'Advance the c-pawn: c4 → c5.':'Click a white piece, then its destination — or drag it.'}</span></div>
    <a className="puzzle-source" href="https://www.chessgames.com/perl/chessgame?gid=1106430" target="_blank" rel="noreferrer">FISCHER — PETROSIAN · CANDIDATES 1959 <span>↗</span></a>
  </div>;
}
function GameArchive() {
  const [view,setView]=useState('all');
  const [selected,setSelected]=useState(gameRecords[0]);
  const visibleGames=view==='GM'||view==='IM'?gameRecords.filter(game=>game.group===view):gameRecords;
  const ranked=[...gameRecords].sort((a,b)=>b.opponentRating-a.opponentRating);
  return <section className="games-section" id="games" aria-labelledby="games-title">
    <div className="section-kicker"><span>THE GAME ARCHIVE</span><span className="kicker-line"/><span>GM + IM OPPONENTS · 2022—23</span></div>
    <div className="games-intro"><div><p className="eyebrow gold-text">SIX RECORDS FROM THE BOARD</p><h2 id="games-title">Measured against<br/><em>the best.</em></h2></div><p>Rapid, blitz and classical encounters against titled opposition. Choose a record to see its tournament details and open the linked game source.</p></div>
    <div className="games-metrics"><div><strong>06</strong><span>ARCHIVED GAMES</span></div><div><strong>04</strong><span>GRANDMASTER OPPONENTS</span></div><div><strong>2527</strong><span>HIGHEST OPPONENT RATING</span></div><div className="games-note">Ratings shown are the opponent's event ratings in the supplied game archive.</div></div>
    <div className="game-explorer">
      <div className="game-art-panel puzzle-art-panel">
        <FischerPuzzle/>
        <div className="game-art-caption"><span>INTERACTIVE CHESS PUZZLE</span><b>1959 <small>FOUR QUEENS</small></b></div>
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
  const [loading,setLoading]=useState(true),[loaderExit,setLoaderExit]=useState(false);
  useEffect(()=>{
    import('../script.js');
    const worldHost=document.getElementById('chess-world-root');
    let worldCleanup=()=>{}, worldCancelled=false;
    let loaderFinished=false;
    let fallbackTimer;
    const finishLoader=()=>{if(loaderFinished)return;loaderFinished=true;setLoaderExit(true);fallbackTimer=window.setTimeout(()=>setLoading(false),480);};
    const loaderTimeout=window.setTimeout(finishLoader,2600);
    const observers=[];
    const loadChessWorld=()=>{if(!worldHost||worldCancelled)return;import('./chess-world.js').then(({mountChessWorld})=>mountChessWorld(worldHost)).then(cleanup=>{if(worldCancelled)cleanup?.();else if(cleanup)worldCleanup=cleanup;clearTimeout(loaderTimeout);finishLoader();}).catch(error=>{console.warn('Using the CSS chessboard fallback.',error);clearTimeout(loaderTimeout);finishLoader();});};
    if(worldHost&&'IntersectionObserver'in window){const worldObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){worldObserver.disconnect();loadChessWorld();}},{rootMargin:'500px 0px'});worldObserver.observe(worldHost);observers.push(worldObserver);}else loadChessWorld();
    const revealTargets=document.querySelectorAll('.intro-section,.personal-story,.feature-section,.games-section,.career-results,.ratings-section,.press-section,.archive-section,.certificate-section,.disciplines-section,.identity-section,.closing-section');
    revealTargets.forEach(target=>target.classList.add('scroll-reveal'));
    if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');revealObserver.unobserve(entry.target);}}),{threshold:.08});observers.push(revealObserver);revealTargets.forEach(target=>revealObserver.observe(target));
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const ratingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const node=entry.target;ratingObserver.unobserve(node);const target=Number(node.dataset.ratingCount);const start=performance.now();node.textContent='0';const count=time=>{const progress=Math.min(1,(time-start)/1050);const eased=1-Math.pow(1-progress,3);node.textContent=String(Math.round(target*eased));if(progress<1)requestAnimationFrame(count);};requestAnimationFrame(count);}),{threshold:.65});observers.push(ratingObserver);document.querySelectorAll('[data-rating-count]').forEach(node=>ratingObserver.observe(node));}
    }else revealTargets.forEach(target=>target.classList.add('in-view'));
    return()=>{worldCancelled=true;clearTimeout(loaderTimeout);clearTimeout(fallbackTimer);worldCleanup();observers.forEach(observer=>observer.disconnect());};
  },[]);
  return <><div className="cinematic-atmosphere" aria-hidden="true"/>{loading&&<div className={`opening-loader${loaderExit?' is-exiting':''}`} aria-hidden="true"><span>VIVEK SHARMA</span><b>♛</b><small>FIDE 45046328 · INDIA</small><i/><p>PREPARING THE BOARD</p></div>}{parse(markup,{replace:node=>{
    if(node.type!=='tag')return;
    if(node.attribs?.id==='sound-control')return <SoundControl/>;
    if(node.attribs?.id==='certificate-showcase-app')return <NationalCertificateShowcase/>;
    if(node.attribs?.id==='certificate-app')return <CertificateGallery/>;
    if(node.attribs?.id==='games-app')return <GameArchive/>;
    if(node.attribs?.id==='chess-world-root')return <div id="chess-world-root" className="chess-world-host" aria-hidden="true"/>;
  }})}<PortfolioAssistant/></>;
}
const root=createRoot(document.getElementById('root'));
if(window.location.pathname==='/'||window.location.pathname==='/index.html')root.render(<HomeApp/>);
else root.render(<SeoPage path={window.location.pathname}/>);
