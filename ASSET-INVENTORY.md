# Public image archive

The production site serves 66 optimized WebP files from `public/images/`: one profile portrait and 65 archive records. The archive contains 27 photographs, 19 certificate records, 17 press clippings and 3 result records. Thirty-five images from the newly added `original-assets` folder were converted to WebP and added to the public archive. Original uploads remain ignored by Git; visitors load the optimized files from the portfolio domain and do not need Drive access.

`src/archive-images.json` is the complete gallery manifest used by the React archive and image filters. `src/certificates.json` drives the animated certificate gallery and the Express API. The production build checks that every archive record points to an existing public image.

## Source records

- [FIDE profile](https://ratings.fide.com/profile/45046328) — identity and published ratings.
- [FIDE Gujarat Open 2026 tournament report](https://ratings.fide.com/report.phtml?event=476857) and [round source report](https://ratings.fide.com/tournament_src_report.phtml?code=476857) — 8.5/10 and round results.
- [Chess-Results Gujarat Open standings](https://s2.chess-results.com/tnr1410225.aspx?SNode=S0&art=5&fed=IND&flag=NO&lan=7&turdet=YES) — Category B standings and event entries.
- [ChessBase India prize report](https://chessbase.in/news/ashutosh-banerjee-wins-4th-gujarat-gm-below-2000-rating-2026) — prize details.
- [ChessArchive player games](https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek) and [round eight replay](https://chessarchive.net/en/game/nLPep24BgP/sharma-vivek-vs-mandloi-mukesh-2026-06-03-4th-gujarat-international-open-grandmasters-chess-tournament-2026-ca).
- [Snoop Chess player record](https://www.snoopchess.com/snoop/otb/45046328) and [MPL National Amateur 2023 report](https://www.chessbase.in/news/MPL-10th-National-Amateur-Chess-Championship-2023-report).
- [Chess-Results Diamant Cup standings](https://s2.chess-results.com/tnr1080457.aspx?SNode=S0&art=1&lan=1&rd=9&turdet=YES&zeilen=99999) and [Bihar Open 2026 standings](https://s1.chess-results.com/tnr1366531.aspx?art=1).

Where tournament databases and certificate text disagree, the site shows both reports with a note instead of presenting an uncertain result as settled.
