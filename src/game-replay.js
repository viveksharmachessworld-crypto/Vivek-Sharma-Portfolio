import { Chess } from 'chess.js';

const boardElement = document.querySelector('#replay-board');
if (boardElement) {
  const pgn = document.querySelector('#pgn-visible')?.textContent || '';
  const parsed = new Chess();
  const position = new Chess();
  const symbols = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
  };

  try {
    parsed.loadPgn(pgn);
    const history = parsed.history({ verbose: true });
    const fens = [position.fen()];
    history.forEach((move) => {
      position.move(move.san);
      fens.push(position.fen());
    });

    const moveList = document.querySelector('#move-list');
    for (let ply = 0; ply < history.length; ply += 2) {
      const row = document.createElement('li');
      const moveNumber = Math.floor(ply / 2) + 1;
      row.textContent = `${moveNumber}. ${history[ply].san}${history[ply + 1] ? ` ${history[ply + 1].san}` : ''}`;
      row.dataset.firstPly = String(ply + 1);
      row.dataset.lastPly = String(Math.min(ply + 2, history.length));
      moveList.append(row);
    }

    let plyIndex = 0;
    const status = document.querySelector('#move-status');
    const controls = {
      start: document.querySelector('#move-start'),
      previous: document.querySelector('#move-previous'),
      next: document.querySelector('#move-next'),
      end: document.querySelector('#move-end'),
    };

    const render = () => {
      const current = new Chess(fens[plyIndex]).board();
      boardElement.replaceChildren();
      current.forEach((rank, rowIndex) => rank.forEach((piece, fileIndex) => {
        const square = document.createElement('div');
        const coordinate = `${'abcdefgh'[fileIndex]}${8 - rowIndex}`;
        square.className = `replay-square ${(rowIndex + fileIndex) % 2 ? 'dark' : 'light'}`;
        square.setAttribute('role', 'gridcell');
        square.setAttribute('aria-label', piece ? `${coordinate}, ${piece.color === 'w' ? 'White' : 'Black'} ${({p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'})[piece.type]}` : `${coordinate}, empty`);
        if (piece) {
          square.textContent = symbols[piece.color][piece.type];
          square.classList.add(piece.color === 'w' ? 'white-piece' : 'black-piece');
        }
        boardElement.append(square);
      }));

      controls.start.disabled = plyIndex === 0;
      controls.previous.disabled = plyIndex === 0;
      controls.next.disabled = plyIndex === history.length;
      controls.end.disabled = plyIndex === history.length;
      if (plyIndex === 0) status.textContent = `Starting position · 0/${history.length} half-moves`;
      else {
        const move = history[plyIndex - 1];
        const number = Math.ceil(plyIndex / 2);
        status.textContent = `${move.color === 'w' ? `${number}.` : `${number}…`} ${move.san} · ${plyIndex}/${history.length}`;
      }
      moveList.querySelectorAll('li').forEach((row) => {
        const first = Number(row.dataset.firstPly), last = Number(row.dataset.lastPly);
        row.classList.toggle('current', plyIndex >= first && plyIndex <= last);
      });
    };

    controls.start.addEventListener('click', () => { plyIndex = 0; render(); });
    controls.previous.addEventListener('click', () => { plyIndex = Math.max(0, plyIndex - 1); render(); });
    controls.next.addEventListener('click', () => { plyIndex = Math.min(history.length, plyIndex + 1); render(); });
    controls.end.addEventListener('click', () => { plyIndex = history.length; render(); });
    render();
  } catch (error) {
    boardElement.setAttribute('aria-label', 'Replay unavailable. Use the PGN below to view the game score.');
    document.querySelector('#move-status').textContent = 'Open the PGN score below';
    console.error('Unable to load the published PGN:', error);
  }
}
