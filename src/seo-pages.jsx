import React, { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import tournamentsSeed from './tournaments.json';
import archiveImages from './archive-images.json';
import gameRecords from './games.json';
import gujaratGames from './games-2026.json';
import mandloiPgn from './games/mandloi.pgn?raw';
import './seo-page.css';

const baseUrl = 'https://www.viveksharmachess.world';
const fideUrl = 'https://ratings.fide.com/profile/45046328';
const profileSources = [
  ['FIDE player profile', fideUrl],
  ['Chess-Results', 'https://chess-results.com/'],
  ['All India Chess Federation', 'https://aicf.in/'],
  ['ChessBase India', 'https://www.chessbase.in/'],
  ['ChessArchive · player games', 'https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek'],
  ['Snoop Chess · player record', 'https://www.snoopchess.com/snoop/otb/45046328'],
  ['ChessPrime · player record', 'https://chessprime.com/players/player/814778/'],
];

const normalize = (path) => {
  const clean = `/${String(path || '/').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}`;
  return clean === '/' ? '/' : `${clean}/`;
};
const tournamentPageIds = {
  '/tournaments/gujarat-international-open-2026/': 'gujarat-open-2026',
  '/achievements/gujarat-open-2026/': 'gujarat-open-2026',
  '/tournaments/bihar-state-rapid-2023/': 'bihar-state-rapid-2023',
  '/tournaments/national-amateur-2023/': 'national-amateur-2023',
  '/tournaments/diamant-cup-2024/': 'diamant-cup-2024',
  '/tournaments/bihar-state-amateur-2024/': 'bihar-state-amateur-2024',
  '/tournaments/shivani-cup-2024/': 'shivani-cup-2024',
  '/tournaments/bihar-state-blitz-2022/': 'bihar-state-blitz-2022',
  '/tournaments/bihar-open-2026/': 'bihar-open-2026',
};

export const seoRoutes = [
  '/about/', '/achievements/', '/tournaments/', '/tournaments/gujarat-international-open-2026/',
  '/tournaments/bihar-state-rapid-2023/', '/tournaments/national-amateur-2023/',
  '/tournaments/diamant-cup-2024/', '/tournaments/bihar-state-amateur-2024/',
  '/tournaments/shivani-cup-2024/', '/tournaments/bihar-state-blitz-2022/',
  '/tournaments/bihar-open-2026/', '/games/', '/games/gujarat-2026/',
  '/games/vivek-sharma-vs-mukesh-mandloi/', '/ratings/', '/fide/', '/gallery/',
  '/journey/', '/opponents/', '/achievements/gujarat-open-2026/',
];

const titleMap = {
  '/about/': ['About Vivek Sharma | International Chess Player', 'Vivek Sharma is an Indian chess player with FIDE ID 45046328. Read his verified profile, ratings, results and chess record.'],
  '/achievements/': ['Vivek Sharma Chess Achievements | Tournament Results', 'Explore Vivek Sharma’s verified chess tournament achievements from 2014 to 2026, with sources and certificate notes.'],
  '/tournaments/': ['Vivek Sharma Chess Tournament Results | Full Archive', 'Search Vivek Sharma’s chess tournament archive by year, placement, tournament type, region, time control and FIDE rating status.'],
  '/tournaments/gujarat-international-open-2026/': ['Vivek Sharma | Gujarat International Open 2026 — 2nd Place', 'Vivek Sharma scored 8.5/10 and finished second in Category B at the 4th Gujarat International Open 2026. FIDE report, sources and game records.'],
  '/tournaments/bihar-state-rapid-2023/': ['Vivek Sharma | Bihar State Rapid Champion 2023', 'The Diksha International Bihar State Rapid Chess Championship 2023–24, certificate evidence, standings and source record for Vivek Sharma.'],
  '/tournaments/national-amateur-2023/': ['Vivek Sharma | National Amateur Runner-Up 2023', 'Vivek Sharma finished second in the Below 2000 Open at the MPL 10th National Amateur Chess Championship 2023.'],
  '/tournaments/diamant-cup-2024/': ['Vivek Sharma | Diamant Cup 2024 — 3rd Place', 'Vivek Sharma scored 7.5/9 and finished third at the 1st Diamant Cup All India Open FIDE Rating Chess Tournament 2024.'],
  '/tournaments/bihar-state-amateur-2024/': ['Vivek Sharma | Bihar State Amateur Chess Championship 2024', 'Vivek Sharma’s third-place result at the Bihar State Amateur Chess Championship 2024, with player count and source links.'],
  '/tournaments/shivani-cup-2024/': ['Vivek Sharma | 42nd Shivani Cup Special Open 2024', 'Vivek Sharma finished second at the 42nd Shivani Cup Special Open in 2024. See the result and Snoop Chess player record.'],
  '/tournaments/bihar-state-blitz-2022/': ['Vivek Sharma | Bihar State Blitz Championship 2022', 'Certificate-verified second place and 7.0 points at the Bihar State Blitz Chess Championship 2022.'],
  '/tournaments/bihar-open-2026/': ['Vivek Sharma | Bihar Open FIDE Rating Chess Tournament 2026', 'Vivek Sharma placed tenth among 615 players at the 2026 Bihar Open FIDE Rating Chess Tournament.'],
  '/games/': ['Vivek Sharma Chess Games | PGN & Game Archive', 'Tournament games, recorded databases and selected PGN replays from Vivek Sharma’s chess record.'],
  '/games/gujarat-2026/': ['Vivek Sharma | Gujarat Open 2026 Chess Games', 'Round-by-round results and verified game sources from Vivek Sharma’s 2026 Gujarat International Open.'],
  '/games/vivek-sharma-vs-mukesh-mandloi/': ['Vivek Sharma vs Mukesh Mandloi | Gujarat Open 2026, Round 8', 'Replay Vivek Sharma vs Mukesh Mandloi, a 47-move win in round 8 of the 2026 Gujarat International Open. View the moves and PGN.'],
  '/ratings/': ['Vivek Sharma Chess Ratings | FIDE 45046328', 'FIDE Standard, Rapid and Blitz ratings for Indian chess player Vivek Sharma, with the date and historical context for each rating.'],
  '/fide/': ['Vivek Sharma FIDE Profile | FIDE 45046328', 'Official FIDE identity and rating profile for Sharma, Vivek of India. FIDE ID 45046328.'],
  '/gallery/': ['Vivek Sharma Chess Photo & Certificate Archive', 'Tournament photographs, press clippings, certificates and result records from Vivek Sharma’s chess archive.'],
  '/journey/': ['Vivek Sharma Chess Journey | 2014–2026', 'A sourced timeline of Vivek Sharma’s chess career, from early Bihar events through national and international tournaments.'],
  '/opponents/': ['Vivek Sharma Chess Opponents | Recorded Games', 'Notable opponents and documented game results from Vivek Sharma’s chess record. Results are shown with player colors and source links.'],
};

export function getPageSeo(path) {
  const normalized = normalize(path);
  const key = normalized === '/achievements/gujarat-open-2026/' ? '/tournaments/gujarat-international-open-2026/' : normalized;
  const [title, description] = titleMap[key] || ['Vivek Sharma Chess Player | FIDE 45046328', 'Official chess profile, tournament archive and game records for Vivek Sharma of India.'];
  const canonicalPath = normalized === '/achievements/gujarat-open-2026/' ? '/tournaments/gujarat-international-open-2026/' : normalized;
  return { title, description, canonical: `${baseUrl}${canonicalPath}` };
}

function ExternalLink({ href, children, className = 'source-link' }) {
  if (!href) return <span className={className}>{children}</span>;
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;
}
function PageHeader() {
  return <header className="page-header"><div className="page-shell"><a className="page-brand" href="/">VS · VIVEK SHARMA CHESS</a><nav className="page-nav" aria-label="Portfolio pages"><a href="/achievements/">Achievements</a><a href="/tournaments/">Tournaments</a><a href="/games/">Games</a><a href="/fide/">FIDE</a></nav></div></header>;
}
function PageFooter() {
  return <footer className="page-footer"><div className="page-shell"><span>VIVEK SHARMA · FIDE ID 45046328 · INDIA</span><a href="/">Official chess portfolio</a><a href="/tournaments/">Tournament archive</a></div></footer>;
}
function PageShell({ path, children, schemaType = 'WebPage' }) {
  const meta = getPageSeo(path);
  const personId = `${baseUrl}/#vivek-sharma`;
  const jsonLd = { '@context': 'https://schema.org', '@type': schemaType, name: meta.title, description: meta.description, url: meta.canonical, about: { '@id': personId }, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` }, { '@type': 'ListItem', position: 2, name: meta.title, item: meta.canonical }] } };
  useEffect(() => {
    document.title = meta.title;
    const setMeta = (selector, attr, value) => { let node = document.querySelector(selector); if (!node) { node = document.createElement('meta'); node.setAttribute(selector.startsWith('meta[property') ? 'property' : 'name', selector.match(/['"]([^'"]+)['"]/)?.[1] || ''); document.head.append(node); } node.setAttribute(attr, value); };
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', meta.canonical);
    let canonical = document.querySelector('link[rel="canonical"]'); if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); } canonical.href = meta.canonical;
  }, [meta.title, meta.description, meta.canonical]);
  return <div className="seo-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/><PageHeader/><main className="page-shell">{children}</main><PageFooter/></div>;
}
function Hero({ eyebrow, title, accent, lead, children }) {
  return <header className="page-hero"><p className="page-eyebrow">{eyebrow}</p><h1>{title}<br/><em>{accent}</em></h1>{lead&&<p className="page-lede">{lead}</p>}{children}</header>;
}
function Facts({ items }) {
  return <div className="page-facts">{items.filter(([,value])=>value!==null&&value!==undefined&&value!=='').map(([label,value])=><div className="page-fact" key={label}><span>{label}</span><b>{value}</b></div>)}</div>;
}
function SourcePanel({ sources = profileSources }) {
  return <section className="source-panel" aria-labelledby="source-panel-title"><div><p className="page-eyebrow">VERIFIABLE CHESS IDENTITY</p><h2 id="source-panel-title">Official profiles<br/><em>& records.</em></h2><p>These links point to player records, official federations and chess tournament databases. Results are attributed to the source shown on each record.</p></div><ul>{sources.map(([name,url])=><li key={name}><ExternalLink href={url}>{name}</ExternalLink></li>)}</ul></section>;
}

function TournamentCard({ event }) {
  const detailPath = seoRoutes.find(path => path.endsWith(`/${event.id}/`));
  const knownFacts = [event.position,event.score,event.players?`${event.players} players`:null,event.rounds?`${event.rounds} rounds`:null].filter(Boolean);
  return <article className="tournament-card"><div className="tournament-card-top"><span>{event.year}</span><span>{event.region}{event.timeControl?` · ${event.timeControl}`:''}{event.fideRated===true?' · FIDE-rated':''}</span></div><h3>{event.name}</h3><p className="tournament-card-facts">{knownFacts.join(' · ') || 'Position not listed in the available record'}</p><dl className="tournament-facts">{event.date&&<div><dt>DATE</dt><dd>{event.date}</dd></div>}{event.location&&<div><dt>LOCATION</dt><dd>{event.location}</dd></div>}{event.category&&<div><dt>CATEGORY</dt><dd>{event.category}</dd></div>}{event.prize&&<div><dt>PRIZE</dt><dd>{event.prize}</dd></div>}{event.award&&<div><dt>AWARD</dt><dd>{event.award}</dd></div>}{event.eventCode&&<div><dt>EVENT CODE</dt><dd>{event.eventCode}</dd></div>}{event.certificate&&<div><dt>EVIDENCE</dt><dd>{event.certificate}</dd></div>}</dl>{event.note&&<p className="source-note discrepancy-note">{event.note}</p>}<div className="tournament-card-links"><ExternalLink href={event.source}>{event.sourceLabel}</ExternalLink>{detailPath&&<a className="source-link" href={detailPath}>Event details →</a>}{event.game&&<a className="source-link" href="/games/gujarat-2026/">Game record →</a>}</div></article>;
}
function TournamentExplorer({ featuredOnly = false }) {
  const [events,setEvents]=useState(tournamentsSeed);
  const [search,setSearch]=useState(''),[year,setYear]=useState('all'),[position,setPosition]=useState('all'),[region,setRegion]=useState('all'),[mode,setMode]=useState('all'),[rated,setRated]=useState('all');
  useEffect(()=>{fetch('/api/tournaments').then(r=>r.ok?r.json():[]).then(rows=>{if(rows.length)setEvents(rows);}).catch(()=>{});},[]);
  const years=useMemo(()=>[...new Set(events.map(x=>String(x.year)))].sort((a,b)=>b.localeCompare(a)),[events]);
  const visible=useMemo(()=>events.filter(event=>{
    const haystack=[event.name,event.year,event.position,event.location,event.category,event.score].filter(Boolean).join(' ').toLowerCase();
    if(featuredOnly&&!['gujarat-open-2026','bihar-state-rapid-2023','national-amateur-2023','diamant-cup-2024','bihar-state-amateur-2024','shivani-cup-2024'].includes(event.id))return false;
    if(search&&!haystack.includes(search.toLowerCase()))return false;
    if(year!=='all'&&!String(event.year).includes(year))return false;
    if(region!=='all'&&event.region!==region)return false;
    if(mode!=='all'&&!String(event.timeControl||'').toLowerCase().includes(mode.toLowerCase()))return false;
    if(rated==='yes'&&event.fideRated!==true)return false;
    if(rated==='no'&&event.fideRated!==false)return false;
    if(position!=='all'){
      const text=String(event.position||'').toLowerCase();
      const rank=position==='1st'?'1st':position==='2nd'?'2nd':position==='3rd'?'3rd':position==='top5'?'top5':null;
      if(rank==='top5'?!/(1st|2nd|3rd|4th|5th|first|second|third)/.test(text):!text.includes(rank))return false;
    }
    return true;
  }),[events,featuredOnly,search,year,position,region,mode,rated]);
  return <><div className="tournament-filters" role="search" aria-label="Filter tournament archive"><label>Search<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tournament, place or location"/></label><label>Year<select value={year} onChange={e=>setYear(e.target.value)}><option value="all">All years</option>{years.map(y=><option key={y}>{y}</option>)}</select></label><label>Position<select value={position} onChange={e=>setPosition(e.target.value)}><option value="all">Any position</option><option value="1st">1st place</option><option value="2nd">2nd place</option><option value="3rd">3rd place</option><option value="top5">Top five</option></select></label><label>Event scope<select value={region} onChange={e=>setRegion(e.target.value)}><option value="all">Any scope</option><option>State</option><option>National</option><option>International</option></select></label><label>Time control<select value={mode} onChange={e=>setMode(e.target.value)}><option value="all">Any format</option><option>Classical</option><option>Rapid</option><option>Blitz</option></select></label><label>FIDE rated<select value={rated} onChange={e=>setRated(e.target.value)}><option value="all">Any status</option><option value="yes">Yes</option><option value="no">No / certificate record</option></select></label></div><p className="results-count" aria-live="polite">{visible.length} of {events.length} tournament records</p><div className="tournament-grid">{visible.map(event=><TournamentCard key={event.id} event={event}/>)}</div>{!visible.length&&<p>No records match those filters. Try clearing a filter.</p>}</>;
}

function DetailPage({ path }) {
  const id=tournamentPageIds[path]; const event=tournamentsSeed.find(item=>item.id===id);
  if(!event)return <NotFound path={path}/>;
  const pictures=archiveImages.filter(item=>item.event===event.name||item.event?.includes(event.name.split(' ').slice(0,2).join(' '))||item.file===('vivek-sharma-gujarat-open-2026-second-place.webp'&&id==='gujarat-open-2026'));
  const paragraph=event.note||`${event.name}: ${event.position||'the player result is not available in the supplied record'}${event.score?`, with a score of ${event.score}`:''}${event.players?`, in a field of ${event.players} players`:''}. The details below link to the cited database or evidence.`;
  return <PageShell path={path} schemaType="Article"><nav className="breadcrumbs"><a href="/">HOME</a> / <a href="/tournaments/">TOURNAMENTS</a> / {event.year}</nav><Hero eyebrow={`TOURNAMENT RECORD · FIDE ID 45046328 · ${event.year}`} title="Vivek Sharma at" accent={event.name} lead={paragraph}><Facts items={[["Final position",event.position],["Score",event.score],["Players",event.players],["Rounds",event.rounds],["Location",event.location],["Dates",event.date],["Category",event.category],["Prize",event.prize],["Award",event.award],["Event code",event.eventCode]]}/></Hero><article className="page-content"><h2>Result and source record</h2><p>{paragraph}</p>{event.note&&<p className="source-note discrepancy-note">Source note: {event.note}</p>}<dl className="event-detail-list">{[["Tournament",event.name],["Year",event.year],["Final position",event.position],["Score",event.score],["Players",event.players],["Rounds",event.rounds],["Location",event.location],["Date",event.date],["Category",event.category],["Prize",event.prize],["Award",event.award],["Event code",event.eventCode],["Certificate / evidence",event.certificate],["Game record",event.game]].filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p><ExternalLink href={event.source}>{`View source: ${event.sourceLabel}`}</ExternalLink></p>{pictures.map(image=><figure className="page-image" key={image.file}><img src={`/images/${encodeURIComponent(image.file)}`} alt={image.caption} width={image.width} height={image.height} loading="lazy"/><figcaption>{image.caption} · {image.detail}</figcaption></figure>)}{id==='gujarat-open-2026'&&<div className="page-links"><a className="page-button" href="/games/gujarat-2026/">Browse the 2026 round records</a><a className="page-button" href="/games/vivek-sharma-vs-mukesh-mandloi/">Replay round 8 · 47 moves</a></div>}<p className="source-note">Tournament information is attributed to the linked record. Historical ratings and results are event-time values.</p></article></PageShell>;
}

function HomeLinkPage({ path, eyebrow, title, accent, lead, children }) {
  return <PageShell path={path}><nav className="breadcrumbs"><a href="/">HOME</a> / {title.toUpperCase()}</nav><Hero eyebrow={eyebrow} title={title} accent={accent} lead={lead}/>{children}</PageShell>;
}
function AboutPage() {
  return <HomeLinkPage path="/about/" eyebrow="PLAYER PROFILE · INDIA" title="Vivek Sharma" accent="International Chess Player." lead="Vivek Sharma is an Indian chess player registered with the International Chess Federation under FIDE ID 45046328. This website brings his official identity, tournament results, games and owner-provided archive together in one sourced profile."><section className="page-content"><h2>Player identity</h2><Facts items={[["Name","Sharma, Vivek"],["FIDE ID","45046328"],["Federation","India · IND"],["Birth year","2002"],["Career archive","2014–2026"],["FIDE over-the-board title","None listed by FIDE"],["FIDE Online Arena title","Arena International Master (AIM)"]]}/><p>“Arena International Master” is the separate FIDE Online Arena (FOA) title shown on FIDE’s profile. It is not a FIDE over-the-board title such as GM, IM, FM or CM.</p><p className="page-links"><a className="page-button" href="/fide/">Open the FIDE profile page</a><a className="page-button" href="/achievements/">Browse chess achievements</a></p></section><SourcePanel/></HomeLinkPage>;
}
function AchievementsPage() {
  const highlights=tournamentsSeed.filter(e=>['gujarat-open-2026','bihar-state-rapid-2023','national-amateur-2023','diamant-cup-2024','bihar-state-amateur-2024','shivani-cup-2024'].includes(e.id));
  return <HomeLinkPage path="/achievements/" eyebrow="VERIFIED RESULTS · 2014–2026" title="Chess achievements" accent="and milestones." lead="A sourced overview of Vivek Sharma’s state, national and international tournament record. Each result links to the database or evidence available for that event."><section className="page-content"><h2>Career highlights</h2><div className="tournament-grid">{highlights.map(event=><TournamentCard key={event.id} event={event}/>)}</div><h2>Complete results archive</h2><p>The complete record includes placements, tournament entries and certificate-verified events. Differences between research notes, database listings and uploaded certificates are shown directly on the relevant record.</p><a className="page-button" href="/tournaments/">Open the searchable tournament archive</a></section><SourcePanel/></HomeLinkPage>;
}
function TournamentsPage({ path='/tournaments/' }) {
  return <HomeLinkPage path={path} eyebrow="CHESS RESULTS · 2014–2026" title="Vivek Sharma tournament" accent="archive." lead="Filter 33 recorded tournaments by year, placement, event scope, time control and FIDE-rated status. Every row includes its source or certificate context."><section className="page-content"><TournamentExplorer/></section><SourcePanel/></HomeLinkPage>;
}

const pgnGame=new Chess();pgnGame.loadPgn(mandloiPgn);const pgnMoves=pgnGame.history({verbose:true});
const replayFens=[new Chess().fen()];
{const replay=new Chess();pgnMoves.forEach(move=>{replay.move(move.san);replayFens.push(replay.fen());});}
const pieceSymbols={w:{p:'♙',n:'♘',b:'♗',r:'♖',q:'♕',k:'♔'},b:{p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'}};
function ChessReplay(){
  const [ply,setPly]=useState(0);const board=new Chess(replayFens[ply]).board();
  const last=ply?pgnMoves[ply-1]:null;
  return <div className="replay-layout"><div className="replay-panel"><div className="replay-board" role="grid" aria-label="Interactive chess game replay">{board.flatMap((rank,row)=>rank.map((piece,col)=>{const square=`${'abcdefgh'[col]}${8-row}`;return <div className={`replay-square ${(row+col)%2?'dark':'light'}`} role="gridcell" aria-label={`${square}${piece?`, ${piece.color==='w'?'White':'Black'} ${{p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'}[piece.type]}`:', empty'}`} key={square}>{piece?pieceSymbols[piece.color][piece.type]:''}</div>;}))}</div><div className="replay-controls"><button onClick={()=>setPly(0)} disabled={!ply} aria-label="Go to start">|←</button><button onClick={()=>setPly(i=>Math.max(0,i-1))} disabled={!ply} aria-label="Previous move">←</button><span className="replay-status" aria-live="polite">{last?`${last.color==='w'?`${Math.ceil(ply/2)}.`:`${Math.ceil(ply/2)}…`} ${last.san} · ${ply}/${pgnMoves.length}`:`Starting position · 0/${pgnMoves.length} half-moves`}</span><button onClick={()=>setPly(i=>Math.min(pgnMoves.length,i+1))} disabled={ply>=pgnMoves.length} aria-label="Next move">→</button><button onClick={()=>setPly(pgnMoves.length)} disabled={ply>=pgnMoves.length} aria-label="Go to end">→|</button></div></div><div className="replay-moves" aria-label="Move list"><ol>{Array.from({length:Math.ceil(pgnMoves.length/2)},(_,i)=><li className={ply>=i*2+1&&ply<=Math.min(i*2+2,pgnMoves.length)?'current':''} key={i}>{pgnMoves[i*2]?.san} {pgnMoves[i*2+1]?.san||''}</li>)}</ol></div></div>;
}
function GujaratGamesPage({path='/games/gujarat-2026/'}){
  return <HomeLinkPage path={path} eyebrow="2026 GUJARAT OPEN · SIX VERIFIED RESULTS" title="Gujarat Open" accent="round archive." lead="The round results below are shown from Vivek Sharma’s perspective. Player order and the 1–0 / 0–1 notation are preserved exactly as recorded in the source table."><section className="page-content"><div className="game-results-table"><div className="game-results-heading"><span>ROUND</span><span>WHITE</span><span>BLACK</span><span>RESULT</span><span>SOURCE</span></div>{gujaratGames.map(game=><article key={game.round} className="game-results-row"><b>R{game.round}</b><span>{game.white}</span><span>{game.black}</span><strong>{game.result}</strong><ExternalLink href={game.source}>{game.sourceLabel}</ExternalLink>{game.note&&<p className="discrepancy-note">{game.note}</p>}</article>)}</div><p className="source-note">All six rounds are referenced in the FIDE report and ChessArchive player database. Local interactive PGN replay is available for round 8; source pages provide other indexed move scores.</p><div className="page-links"><a className="page-button" href="/games/vivek-sharma-vs-mukesh-mandloi/">Open the round 8 interactive replay</a><ExternalLink href="https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek">Open all currently indexed ChessArchive games</ExternalLink></div></section><SourcePanel sources={[["FIDE round report",'https://ratings.fide.com/tournament_src_report.phtml?code=476857'],["ChessArchive player games",'https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek'],["Chess-Results tournament games",'https://s3.chess-results.com/partiesuche.aspx?art=4&lan=14&rd=6&tnr=1410225']]}/></HomeLinkPage>;
}
function MandloiGamePage(){
  return <PageShell path="/games/vivek-sharma-vs-mukesh-mandloi/" schemaType="Article"><nav className="breadcrumbs"><a href="/">HOME</a> / <a href="/games/">GAMES</a> / ROUND 8</nav><Hero eyebrow="Gujarat International Open 2026 · Category B · Round 8" title="Vivek Sharma vs" accent="Mukesh Mandloi." lead="Vivek Sharma won 1–0 in 47 moves on 3 June 2026. The recorded game is reproduced below as a replay and PGN, without engine-evaluation claims."><Facts items={[["Result","1–0"],["Date","3 June 2026"],["Round","8 · Board 7"],["Opening","A46"],["Event","FIDE-rated classical"]]}/></Hero><article className="page-content"><h2>Replay the game</h2><ChessReplay/><details><summary>View and copy the complete PGN</summary><pre className="pgn-score">{mandloiPgn}</pre></details><h2>Sources and event context</h2><p>The FIDE tournament report confirms the event result and rating change. The exact game score is indexed by ChessArchive and ChessBase’s shared PGN record.</p><p className="page-links"><ExternalLink href="https://chessarchive.net/en/game/nLPep24BgP/sharma-vivek-vs-mandloi-mukesh-2026-06-03-4th-gujarat-international-open-grandmasters-chess-tournament-2026-ca">View ChessArchive game and PGN</ExternalLink><ExternalLink href="https://share.chessbase.com/SharedGames/frame/?p=9C6s14Z0TGYr5ZtmOORid84RC8ueSqcvhCTlX%2FX%2FnF1PrDQXfgobkxEtwxzvpbiJ">Open ChessBase shared game record</ExternalLink><ExternalLink href="https://ratings.fide.com/tournament_src_report.phtml?code=476857">View official FIDE round report</ExternalLink></p><a className="page-button" href="/tournaments/gujarat-international-open-2026/">View the Gujarat Open achievement record</a></article></PageShell>;
}
function GamesPage({path='/games/'}){
  return <HomeLinkPage path={path} eyebrow="GAME ARCHIVE · PGN SOURCES" title="Vivek Sharma chess" accent="games." lead="Tournament scores, linked PGN records and interactive replay. Database totals are a dated snapshot and may change as archives add games."><section className="page-content"><Facts items={[["ChessPrime games","29 currently recorded"],["ChessArchive games","12 currently recorded"],["FIDE ID","45046328"],["Local replay","Gujarat Open · Round 8"]]}/><p className="source-note">Counts are currently recorded in the referenced databases and checked 8 October 2026. They are not permanent totals.</p><h2>Gujarat Open 2026</h2><p>Six verified round results, with links to the source records and an interactive local replay for round 8.</p><a className="page-button" href="/games/gujarat-2026/">Browse the Gujarat Open game archive</a><h2>Selected games against titled opposition</h2><div className="tournament-grid">{gameRecords.map(game=><article className="tournament-card" key={game.id}><div className="tournament-card-top"><span>{game.year}</span><span>{game.format} · {game.result}</span></div><h3>{game.opponentTitle} {game.opponent}</h3><p>{game.event} · {game.date}</p><p className="source-note">{game.outcome} for Vivek · opponent’s event rating {game.opponentRating}</p><ExternalLink href={game.source}>{game.sourceLabel}</ExternalLink></article>)}</div><p className="page-links"><ExternalLink href="https://chessprime.com/players/player/814778/">View ChessPrime games</ExternalLink><ExternalLink href="https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek">View ChessArchive games and PGN records</ExternalLink></p></section><SourcePanel/></HomeLinkPage>;
}

function FidePage(){return <HomeLinkPage path="/fide/" eyebrow="OFFICIAL PLAYER IDENTITY · FIDE" title="Sharma, Vivek" accent="FIDE profile." lead="The official FIDE profile identifies Vivek Sharma as an Indian player with FIDE ID 45046328. The linked profile is the authority for identity and published ratings."><section className="page-content"><Facts items={[["Name","Sharma, Vivek"],["FIDE ID","45046328"],["Federation","IND · India"],["Birth year","2002"],["Standard rating · Oct 2026","1975"],["Rapid rating · Oct 2026","1941 · inactive"],["Blitz rating · Oct 2026","1875"],["FIDE title","None listed"],["FOA title","Arena International Master"]]}/><p>FIDE’s player profile lists no over-the-board title. It separately lists Arena International Master as the FIDE Online Arena (FOA) title.</p><p><ExternalLink href={fideUrl}>View the official FIDE profile for FIDE ID 45046328</ExternalLink></p><p className="source-note">Ratings above are the October 2026 FIDE profile snapshot; the live FIDE page may show newer values.</p></section><SourcePanel sources={[["Official FIDE profile · 45046328",fideUrl],["Chess-Results player/tournament records",'https://chess-results.com/'],["All India Chess Federation",'https://aicf.in/']]}/></HomeLinkPage>;}
function RatingsPage(){return <HomeLinkPage path="/ratings/" eyebrow="FIDE RATING SNAPSHOT · OCTOBER 2026" title="Chess ratings for" accent="Vivek Sharma." lead="The FIDE profile listed Standard 1975, Rapid 1941 and Blitz 1875 in October 2026. Standard is the FIDE label for the classical time control."><section className="page-content"><Facts items={[["Standard · current","1975 · active"],["Rapid · current","1941 · inactive"],["Blitz · current","1875"],["Peak Standard","1975"],["Peak Blitz","1881 · August 2026"]]}/><p>These values are a dated snapshot, not a promise of current ratings. FIDE’s monthly profile history shows a Blitz rating of 1881 in August 2026 and a Standard peak of 1975.</p><ExternalLink href={fideUrl}>Check current FIDE ratings</ExternalLink></section><SourcePanel sources={[["FIDE rating profile",fideUrl],["Snoop Chess player overview",'https://www.snoopchess.com/snoop/otb/45046328']]}/></HomeLinkPage>;}

function JourneyPage(){
  const timeline=[['2014','School-level competitive chess'],['2016','Bihar State U-15 and U-11/U-17 championships'],['2018','ECR Open Rapid · National Junior Open · Barauni · Darbhanga · Patna District U-19'],['2019','Bihar State Rapid · Bihar State U-17'],['2022','Bihar State Blitz · National Amateur · national rapid, blitz and team events'],['2023','Bihar State Rapid champion · National Amateur runner-up · International Chess Day Blitz · Bihar State Senior'],['2024','Diamant Cup · Bihar State Amateur · Shivani Cup · New Delhi Rapid · Rajasthan Open'],['2025','Royal Jaipur Rapid · Athens of the East · Khelo Chess Academy · Bihar State Rapid'],['2026','Bihar Open · Gujarat International Open Category B runner-up · 8.5/10']];
  return <HomeLinkPage path="/journey/" eyebrow="A CHESS RECORD · 2014–2026" title="Vivek Sharma’s" accent="chess journey." lead="A chronological view of the tournaments and records in the supplied archive. Each result can be checked in the tournament archive and its linked sources."><section className="page-content"><ol className="career-timeline">{timeline.map(([year,text])=><li key={year}><time>{year}</time><p>{text}</p></li>)}</ol><a className="page-button" href="/tournaments/">Search all tournament records</a></section></HomeLinkPage>;
}
function OpponentsPage(){
  const opponents=[{name:'GM Michal Krasenkow',event:'20th Delhi International Open 2023',result:'1–0 for Krasenkow',note:'Event ratings shown in the game archive.',url:'https://chessprime.com/players/player/814778/'},{name:'Vishnu Prasanna V',event:'MPL National Blitz Championship 2022',result:'1–0 for Vishnu Prasanna V',note:'Recorded in the game archive.',url:'https://chessprime.com/players/player/814778/'},{name:'Diptayan Ghosh',event:'MPL National Rapid Championship 2022',result:'1–0 for Ghosh',note:'The linked score record is from round 2.',url:'https://www.chessbox.in/chessgame/ghosh-diptayan-sharma-vivek/'},{name:'Abhijeet Joshi',event:'11th National Amateur Chess Championship 2024',result:'½–½ draw · 65 moves',note:'The game database lists the draw and final move at 65.',url:'https://www.snoopchess.com/snoop/otb/45046328'}];
  return <HomeLinkPage path="/opponents/" eyebrow="RECORDED GAME SCORES" title="Notable chess" accent="opponents." lead="These entries identify opponents and source-recorded results. They do not imply an unrecorded win or a formal title for Vivek Sharma."><section className="page-content"><div className="tournament-grid">{opponents.map(person=><article className="tournament-card" key={person.name}><div className="tournament-card-top"><span>GAME RECORD</span><span>RESULT ATTRIBUTED TO SOURCE</span></div><h3>{person.name}</h3><p>{person.event}</p><strong>{person.result}</strong><p className="source-note">{person.note}</p><ExternalLink href={person.url}>Open the player game record</ExternalLink></article>)}</div></section><SourcePanel/></HomeLinkPage>;
}
function GalleryPage(){
  const [filter,setFilter]=useState('all'),[search,setSearch]=useState(''),[selected,setSelected]=useState(null);
  useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setSelected(null);if(selected!==null&&e.key==='ArrowRight')setSelected(i=>(i+1)%archiveImages.length);if(selected!==null&&e.key==='ArrowLeft')setSelected(i=>(i-1+archiveImages.length)%archiveImages.length);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[selected]);
  const visible=archiveImages.map((image,index)=>({...image,index})).filter(image=>(filter==='all'||image.kind===filter)&&(!search||`${image.caption} ${image.event||''} ${image.year||''}`.toLowerCase().includes(search.toLowerCase())));
  return <HomeLinkPage path="/gallery/" eyebrow="OWNER-PROVIDED ARCHIVE · 2014–2026" title="Chess certificates" accent="and photographs." lead="The archive includes tournament photographs, certificates, press records and result screenshots. Images are served from this website and open in a keyboard-accessible viewer."><section className="page-content"><div className="gallery-filters"><label>Search archive<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Event, year or evidence"/></label><label>Evidence type<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All evidence · 65</option><option value="photograph">Photographs · 27</option><option value="certificate">Certificates · 17</option><option value="press">Press · 18</option><option value="result">Results · 3</option></select></label></div><p className="results-count" aria-live="polite">Showing {visible.length} of 65 archive images</p><div className="archive-page-grid">{visible.map(image=><button key={image.file} className="archive-page-card" onClick={()=>setSelected(image.index)}><img src={`/images/${encodeURIComponent(image.file)}`} alt={image.caption} width={image.width} height={image.height} loading="lazy"/><span><small>{image.year?`${image.year} · `:''}{image.evidenceType||image.kind}</small><b>{image.caption}</b></span></button>)}</div>{selected!==null&&<div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={archiveImages[selected].caption} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}><button className="gallery-close" onClick={()=>setSelected(null)} aria-label="Close image viewer">×</button><button className="gallery-step" onClick={()=>setSelected(i=>(i-1+archiveImages.length)%archiveImages.length)} aria-label="Previous image">←</button><figure><img src={`/images/${encodeURIComponent(archiveImages[selected].file)}`} alt={archiveImages[selected].caption}/><figcaption>{archiveImages[selected].caption} · {archiveImages[selected].detail}{archiveImages[selected].event?` · ${archiveImages[selected].event}`:''}{archiveImages[selected].year?` · ${archiveImages[selected].year}`:''}</figcaption></figure><button className="gallery-step" onClick={()=>setSelected(i=>(i+1)%archiveImages.length)} aria-label="Next image">→</button></div>}</section></HomeLinkPage>;
}

function NotFound({path}){return <PageShell path={path}><section className="page-hero"><p className="page-eyebrow">PAGE NOT FOUND</p><h1>Return to the<br/><em>main position.</em></h1><p className="page-lede">This page is not in Vivek Sharma’s published chess archive.</p><a className="page-button" href="/">Open the portfolio home page</a></section></PageShell>;}

export default function SeoPage({ path }) {
  const route=normalize(path);
  if(tournamentPageIds[route])return <DetailPage path={route}/>;
  if(route==='/about/')return <AboutPage/>;
  if(route==='/achievements/')return <AchievementsPage/>;
  if(route==='/tournaments/')return <TournamentsPage/>;
  if(route==='/games/')return <GamesPage/>;
  if(route==='/games/gujarat-2026/')return <GujaratGamesPage/>;
  if(route==='/games/vivek-sharma-vs-mukesh-mandloi/')return <MandloiGamePage/>;
  if(route==='/ratings/')return <RatingsPage/>;
  if(route==='/fide/')return <FidePage/>;
  if(route==='/gallery/')return <GalleryPage/>;
  if(route==='/journey/')return <JourneyPage/>;
  if(route==='/opponents/')return <OpponentsPage/>;
  return <NotFound path={route}/>;
}
