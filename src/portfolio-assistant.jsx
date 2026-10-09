import React, { useEffect, useRef, useState } from 'react';

// Offline, retrieval-style answers from owner-provided portfolio content. No network or model API.
const knowledge = [
  { keys: ['born', 'birth', 'birthday', 'age', 'when was'], answer: 'Vivek Sharma was born on 16 December 2002 in Gopalpur Village, Naubatpur, Patna district, Bihar, India.' },
  { keys: ['where', 'village', 'gopalpur', 'naubatpur', 'bihar'], answer: 'Vivek is from Gopalpur Village in Naubatpur, Patna district, Bihar, India. His chess journey began far from India’s major chess centres.' },
  { keys: ['father', 'ravishankar', 'first move'], answer: 'Vivek’s father, Late Ravishankar Kumar, introduced him to chess, became his first coach and encouraged his ambitions. Vivek says he wants to carry his father’s dream forward.' },
  { keys: ['mother', 'veena'], answer: 'Vivek’s mother is Veena Devi. In his account, she supported the family’s demanding early training routine.' },
  { keys: ['brother', 'vishal'], answer: 'Vivek trained and competed alongside his brother Vishal Sharma, who also became a national-level chess player. They trained together for about five years and won Bihar state age-group titles.' },
  { keys: ['training', 'routine', '3 am', 'sunrise', 'practice'], answer: 'Vivek describes an intense training routine that often began around 3:00 a.m., followed by another long chess-work session from about 8:00 a.m. to 8:00 p.m. Work included openings, tactics, calculation, endgames, preparation and game analysis.' },
  { keys: ['school', 'education', 'aswani'], answer: 'Vivek began at a local rural school and later attended Aswani Public School (CBSE), where he studied through Class 2.' },
  { keys: ['under 13', 'u-13', 'runner up', 'first major', 'fide id'], answer: 'Vivek was runner-up at the Bihar State Under-13 Championship. He later played at the National Under-13 Championship, where his FIDE identity was established. His FIDE ID is 45046328 and his initial FIDE rating was 1510.' },
  { keys: ['2015', 'under 25', 'u-25', 'youth championship'], answer: 'At the 24th National Youth (Under-25) Chess Championship in Patna in October 2015, Vivek represented Bihar. His certificate records 5.5/9 and 20th place. Chess-Results confirms his entry under FIDE ID 45046328. See /tournaments/?year=2015.' },
  { keys: ['2016', 'under 15', 'u-15'], answer: 'In June 2016, Vivek scored 7.5/8 to win the Bihar State Under-15 Championship in Kishanganj.' },
  { keys: ['2017', 'under 19', 'u-19', 'national junior'], answer: 'At the 47th National Junior (Under-19) Open Chess Championship in Patna in September 2017, Vivek’s certificate records 6/11 and 39th place. Chess-Results confirms his event entry under FIDE ID 45046328. See /tournaments/?year=2017.' },
  { keys: ['under 17', 'u-17', 'champion'], answer: 'Vivek says he became Bihar State Under-17 Champion. He describes the period that followed as a difficult dispute that restricted his ability to compete.' },
  { keys: ['ban', 'suspension', 'dispute', 'association', 'federation', 'court', 'high court'], answer: 'Vivek’s account says a disagreement arose over advance travel, accommodation and food support for selected players, after earlier expected reimbursements had not arrived. He says he and his family asked for support before travelling, after which he was suspended or banned. The dispute reached the High Court; Vivek says he later chose to pause the case after a discussion in which the Association’s side expressed regret. This is his personal account of a contested matter, not an independently adjudicated summary.' },
  { keys: ['2019', 'passed away', 'loss', 'died'], answer: 'Vivek’s father, Late Ravishankar Kumar, passed away in 2019. Vivek remembers him as his first chess teacher, guide and strongest believer.' },
  { keys: ['break', 'away', 'hiatus', '2020', 'responsibility', 'family'], answer: 'From 2020, Vivek says he reduced his regular tournament activity for approximately four years while taking care of family, home, farming and financial responsibilities. Databases show selected events in 2022 and 2023, so it was a reduced-activity period rather than a complete absence from tournaments. He says chess’s lessons helped him stay disciplined and rebuild stability.' },
  { keys: ['married', 'wife', 'neha', '2026'], answer: 'Vivek says he married Neha Kumari in 2026, and that this new chapter coincided with his return to chess.' },
  { keys: ['gujarat', 'comeback', 'runner-up', 'runner up', '8.5', 'prize'], answer: 'At the 4th Gujarat International Open Grandmasters Chess Tournament 2026, Category B, Vivek scored 8.5/10 and finished runner-up among 313 players. The supplied details list a ₹1,00,000 prize and trophy. The FIDE tournament report records his FIDE ID, score and a +33 rating change. Event page: /tournaments/gujarat-international-open-2026/ · FIDE report: https://ratings.fide.com/tournament_src_report.phtml?code=476857' },
  { keys: ['achievement', 'achievements', 'tournament result', 'results', 'podium', 'won'], answer: 'Selected records on the portfolio include: runner-up at the 2026 Gujarat International Open Category B (8.5/10 among 313); runner-up at the 2023 MPL National Amateur Below 2000; winner of the 2023 Diksha International Bihar State Rapid Championship and its 8-round Blitz section (8/8 per the uploaded certificate); third at the 2024 Diamant Cup and Bihar State Amateur Championship; and 10th at the 2026 Bihar Open. Explore the tournament archive: /tournaments/ · Gujarat event: /tournaments/gujarat-international-open-2026/' },
  { keys: ['gold', 'dream', 'goal', 'grandmaster', 'international master', 'represent india'], answer: 'Vivek’s stated goals are to earn the International Master and Grandmaster titles, represent India and one day help bring a gold medal home for the country.' },
  { keys: ['lesson', 'life', 'belief', 'chess teach'], answer: 'Vivek says chess taught him to think before acting, stay disciplined, analyse situations, remain calm under pressure, accept mistakes and keep searching for a solution when things become difficult.' },
  { keys: ['rating', 'classical', 'standard', 'rapid', 'blitz'], answer: 'The portfolio’s October 2026 FIDE snapshot lists Standard (classical) 1975, Rapid 1941 and Blitz 1875. Ratings can change, so the official FIDE profile linked on the site is the best place to check current figures.' },
  { keys: ['title', 'aim', 'arena master'], answer: 'The profile lists Arena International Master (AIM) as Vivek’s FIDE Online Arena title. His FIDE profile does not list an over-the-board title.' },
  { keys: ['links', 'source', 'profile', 'website', 'fide'], answer: 'Official FIDE profile: https://ratings.fide.com/profile/45046328. Tournament, game and archive links are also collected throughout this portfolio.' },
  { keys: ['hello', 'hi', 'hey', 'namaste'], answer: 'Hello! I’m Vivek’s offline portfolio assistant. Ask me about his chess journey, family, training, tournaments, ratings or goals.' },
];

function answerQuestion(input) {
  const query = input.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const ranked = knowledge.map(item => ({ item, score: item.keys.reduce((score, key) => score + (query.includes(key) ? Math.max(1, key.split(' ').length) : 0), 0) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].item.answer : 'I don’t have that detail in the portfolio information I was given. Try asking about Vivek’s hometown, training, family, chess results, ratings or goals. You can also follow the links on this site to check official chess records.';
}

export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false), [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! Ask me about Vivek’s chess journey, results, ratings or goals. I work offline, with no AI or server API.' }]);
  const [draft, setDraft] = useState(''), [listening, setListening] = useState(false), [speak, setSpeak] = useState(false);
  const log = useRef(null), recognition = useRef(null), input = useRef(null);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, open]);
  useEffect(() => () => { recognition.current?.stop(); window.speechSynthesis?.cancel(); }, []);
  const submit = (text = draft) => {
    const question = text.trim(); if (!question) return;
    const response = answerQuestion(question);
    setMessages(previous => [...previous, { from: 'user', text: question }, { from: 'bot', text: response }]); setDraft('');
    if (speak && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(response); utterance.lang = 'en-IN'; window.speechSynthesis.speak(utterance); }
  };
  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setMessages(previous => [...previous, { from: 'bot', text: 'Voice input is not supported by this browser. You can still type here; spoken replies use your browser’s built-in speech feature.' }]); return; }
    const instance = new Recognition(); recognition.current = instance; instance.lang = 'en-IN'; instance.interimResults = false; instance.maxAlternatives = 1;
    instance.onstart = () => setListening(true); instance.onend = () => setListening(false); instance.onerror = () => setListening(false); instance.onresult = event => submit(event.results[0][0].transcript); instance.start();
  };
  return <div className="portfolio-assistant">
    {open && <section className="assistant-panel" aria-label="Offline portfolio assistant">
      <header className="assistant-head"><div><span>VIVEK SHARMA</span><small>OFFLINE PORTFOLIO ASSISTANT</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button></header>
      <div className="assistant-messages" ref={log} aria-live="polite">{messages.map((message, i) => <p className={`assistant-message ${message.from}`} key={i}>{message.text.split(/(https?:\/\/[^\s]+|\/(?:tournaments|games|achievements)\/(?:[a-z0-9-]+\/)?)/gi).map((part, j) => /^https?:\/\//i.test(part) || /^\/(?:tournaments|games|achievements)\//i.test(part) ? <a key={j} href={part} target={/^https?:\/\//i.test(part) ? '_blank' : undefined} rel="noreferrer">{part}</a> : part)}</p>)}</div>
      <div className="assistant-tools"><button type="button" aria-pressed={speak} onClick={() => setSpeak(!speak)}>{speak ? '🔊 READ REPLIES ON' : '🔈 READ REPLIES OFF'}</button><button type="button" onClick={startVoice} aria-pressed={listening}>{listening ? 'LISTENING…' : '🎙 ASK BY VOICE'}</button></div>
      <form className="assistant-form" onSubmit={event => { event.preventDefault(); submit(); }}><input ref={input} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask about Vivek…" aria-label="Ask a question"/><button type="submit" aria-label="Send message">↗</button></form>
      <small className="assistant-disclosure">No AI or server API is used. Read-aloud uses your device voice; voice input depends on browser support and its speech-recognition service.</small>
    </section>}
    <button className={`assistant-launch${open ? ' is-open' : ''}`} type="button" onClick={() => { setOpen(!open); if (!open) setTimeout(() => input.current?.focus(), 60); }} aria-expanded={open} aria-label={open ? 'Close portfolio assistant' : 'Ask about Vivek Sharma'}>{open ? '×' : <><span aria-hidden="true">♛</span><span>ASK ABOUT VIVEK</span></>}</button>
  </div>;
}
