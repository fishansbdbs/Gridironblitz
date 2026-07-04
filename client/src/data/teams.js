export const TEAMS = [
  {
    id: 'mammoths',
    name: 'Metro Mammoths',
    shortName: 'MAM',
    identity: 'Balanced team with a sturdy pocket and clean timing routes.',
    logo: { letter: 'M', mark: 'tusk', label: 'Block tusk' },
    colors: { primary: '#1f67d2', secondary: '#f5f7fb', accent: '#aeb8c7', pants: '#dfe5ee', away: '#f7fbff', dark: '#0f2c5f' },
    uniforms: {
      home: { helmet: '#b8c4d6', jersey: '#1f67d2', pants: '#e8edf5', stripe: '#ffffff', number: '#f8fafc' },
      away: { helmet: '#d8e0eb', jersey: '#f7fbff', pants: '#c6cfdd', stripe: '#1f67d2', number: '#1f67d2' }
    },
    stats: { speed: 6, power: 7, passing: 7, defense: 6 },
    gameplay: { speed: 66, acceleration: 66, strength: 72, blocking: 74, tackling: 68, catching: 70, throwAccuracy: 74, throwPower: 72, routeRunning: 72, coverage: 66, agility: 68 },
    roster: {
      QB: { name: 'Atlas Reed', number: 12, throwAccuracy: 82, throwPower: 78 },
      RB: { name: 'Milo Stone', number: 28, speed: 72, strength: 76 },
      WR1: { name: 'Nico Vale', number: 18, catching: 78, routeRunning: 78 },
      WR2: { name: 'Taj Sterling', number: 81, speed: 74, catching: 74 },
      TE: { name: 'Grant Hooper', number: 86, blocking: 78, catching: 72 },
      OL1: { name: 'Bram Knox', number: 66, blocking: 84, strength: 84 },
      OL2: { name: 'Leon Pike', number: 70, blocking: 80, strength: 82 }
    }
  },
  {
    id: 'vipers',
    name: 'Desert Vipers',
    shortName: 'VIP',
    identity: 'Fast, aggressive team that wins with speed and pressure.',
    logo: { letter: 'V', mark: 'fang', label: 'Viper fang' },
    colors: { primary: '#b91c24', secondary: '#111111', accent: '#d6a83a', pants: '#171717', away: '#fff3c4', dark: '#3b0709' },
    uniforms: {
      home: { helmet: '#111111', jersey: '#b91c24', pants: '#151515', stripe: '#d6a83a', number: '#ffe8a3' },
      away: { helmet: '#d6a83a', jersey: '#fff3c4', pants: '#181818', stripe: '#b91c24', number: '#7f1117' }
    },
    stats: { speed: 8, power: 5, passing: 6, defense: 7 },
    gameplay: { speed: 82, acceleration: 84, strength: 58, blocking: 58, tackling: 74, catching: 70, throwAccuracy: 66, throwPower: 70, routeRunning: 78, coverage: 78, agility: 82 },
    roster: {
      QB: { name: 'Rafe Sol', number: 7, speed: 74, throwPower: 76 },
      RB: { name: 'Kip Dune', number: 22, speed: 86, agility: 88 },
      WR1: { name: 'Jax Venom', number: 11, speed: 92, catching: 82, routeRunning: 86 },
      WR2: { name: 'Rook Sable', number: 84, speed: 84, routeRunning: 80 },
      TE: { name: 'Oz Fang', number: 89, strength: 72, catching: 68 },
      OL1: { name: 'Caldera West', number: 68, blocking: 68, strength: 72 },
      OL2: { name: 'Juno Rigg', number: 77, blocking: 66, strength: 70 }
    }
  },
  {
    id: 'owls',
    name: 'Iron Owls',
    shortName: 'OWL',
    identity: 'Smart passing team with route precision and calm QB play.',
    logo: { letter: 'O', mark: 'eyes', label: 'Iron eyes' },
    colors: { primary: '#5a2a83', secondary: '#7d8790', accent: '#ffffff', pants: '#b9c0c7', away: '#f7f4ff', dark: '#241331' },
    uniforms: {
      home: { helmet: '#7d8790', jersey: '#5a2a83', pants: '#cbd1d8', stripe: '#ffffff', number: '#ffffff' },
      away: { helmet: '#cbd1d8', jersey: '#f7f4ff', pants: '#7d8790', stripe: '#5a2a83', number: '#5a2a83' }
    },
    stats: { speed: 5, power: 6, passing: 9, defense: 6 },
    gameplay: { speed: 60, acceleration: 62, strength: 66, blocking: 66, tackling: 66, catching: 84, throwAccuracy: 88, throwPower: 78, routeRunning: 88, coverage: 70, agility: 72 },
    roster: {
      QB: { name: 'Orion Vale', number: 9, throwAccuracy: 94, throwPower: 84 },
      RB: { name: 'Ezra Quill', number: 24, catching: 76, agility: 76 },
      WR1: { name: 'Silas Night', number: 10, catching: 88, routeRunning: 92 },
      WR2: { name: 'Ivo Slate', number: 19, catching: 84, routeRunning: 88 },
      TE: { name: 'Marek Bell', number: 82, catching: 82, blocking: 72 },
      OL1: { name: 'Tomas Rivet', number: 63, blocking: 76, strength: 78 },
      OL2: { name: 'Nolan Wedge', number: 71, blocking: 74, strength: 76 }
    }
  },
  {
    id: 'bulls',
    name: 'Bayou Bulls',
    shortName: 'BUL',
    identity: 'Physical running team that leans on blocking and tackles.',
    logo: { letter: 'B', mark: 'horns', label: 'Bayou horns' },
    colors: { primary: '#17633a', secondary: '#f2ead3', accent: '#9b6a35', pants: '#e9dcc1', away: '#f2ead3', dark: '#08351f' },
    uniforms: {
      home: { helmet: '#9b6a35', jersey: '#17633a', pants: '#e9dcc1', stripe: '#f2ead3', number: '#f2ead3' },
      away: { helmet: '#9b6a35', jersey: '#f2ead3', pants: '#17633a', stripe: '#9b6a35', number: '#17633a' }
    },
    stats: { speed: 5, power: 9, passing: 5, defense: 8 },
    gameplay: { speed: 58, acceleration: 58, strength: 88, blocking: 88, tackling: 84, catching: 62, throwAccuracy: 58, throwPower: 70, routeRunning: 60, coverage: 72, agility: 58 },
    roster: {
      QB: { name: 'Beau Ransom', number: 4, strength: 76, throwPower: 76 },
      RB: { name: 'Bronco Moss', number: 33, strength: 94, speed: 70, agility: 72 },
      WR1: { name: 'Lev Cypress', number: 15, catching: 72, strength: 72 },
      WR2: { name: 'Rye Noble', number: 87, catching: 68, routeRunning: 66 },
      TE: { name: 'Gus Mire', number: 88, blocking: 86, strength: 88 },
      OL1: { name: 'Otis Drum', number: 75, blocking: 92, strength: 94 },
      OL2: { name: 'Knox River', number: 79, blocking: 90, strength: 92 }
    }
  }
];
