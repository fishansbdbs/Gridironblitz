import {
  PLAYS,
  applyPlayResult,
  bannerFor,
  logoHtml
} from './GameShared.js';

export const gameRuntimeScoringMethods = {
  endPlay(result) {
    if (this.phase !== 'live') return;
    this.phase = 'result';
    applyPlayResult(this.match, result);
    if (this.match.score.home >= (this.match.scoreTarget ?? this.settings.scoreTarget)) this.match.winner = this.match.homeTeam.name;
    if (this.match.score.away >= (this.match.scoreTarget ?? this.settings.scoreTarget)) this.match.winner = this.match.awayTeam.name;
    this.status = result.message || this.match.history[0]?.message || `${result.yards} yards.`;
    this.banner = bannerFor(result, this.status);
    this.sound(result.type === 'touchdown' ? 'touchdown' : result.type === 'interception' ? 'turnover' : result.type === 'incomplete' ? 'whistle' : 'tackle');
    this.shake = result.type === 'touchdown' ? 0.22 : 0.13;
    this.renderHud();
    setTimeout(() => {
      if (this.match.winner) {
        this.showResults();
        return;
      }
      this.phase = 'play-select';
      this.banner = '';
      this.lineup();
      this.renderHud();
      if (this.match.possession === 'away' && this.mode !== 'practice') {
        setTimeout(() => {
          this.callPlay(PLAYS[Math.floor(Math.random() * PLAYS.length)]);
          setTimeout(() => this.snap(), 650);
        }, 700);
      }
    }, 1250);
  },
  showResults() {
    this.phase = 'results';
    const stat = this.match.stats;
    this.uiRoot.innerHTML = `
      <section class="screen compact-screen">
        <h2>${this.match.winner} Wins</h2>
        <p class="final-score">${logoHtml(this.match.homeTeam)} ${this.match.homeTeam.shortName} ${this.match.score.home} | ${logoHtml(this.match.awayTeam)} ${this.match.awayTeam.shortName} ${this.match.score.away}</p>
        <div class="stat-grid">
          <span>Home TD ${stat.home.touchdowns}</span><span>Away TD ${stat.away.touchdowns}</span>
          <span>Home Pass ${stat.home.passingYards}</span><span>Away Pass ${stat.away.passingYards}</span>
          <span>Home Rush ${stat.home.rushingYards}</span><span>Away Rush ${stat.away.rushingYards}</span>
          <span>INT ${stat.home.interceptions + stat.away.interceptions}</span><span>Target ${this.settings.scoreTarget}</span>
        </div>
        <button data-action="rematch">Rematch</button>
        <button data-action="main-menu">Main Menu</button>
      </section>
    `;
  }
};
