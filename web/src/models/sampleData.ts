/* MODEL : profils fictifs d'illustration (affichés tant qu'il n'y a pas de vrais profils vérifiés). */
export const COL: [string, string, string, string][] = [
  ['#15357a', '#0b1b3f', '#ffffff', '#b97c52'], ['#0f8a63', '#064a37', '#ffc629', '#8d5a3b'], ['#65452a', '#0f1c3a', '#ffffff', '#a86f49'],
  ['#15357a', '#75441c', '#ffc629', '#c68f64'], ['#0f8a63', '#07402f', '#ffffff', '#9a6040'], ['#65452a', '#14224a', '#ffc629', '#b97c52'],
];

export type SamplePlayer = [name: string, age: number, country: string, city: string, position: string, short: string, foot: string, height: string, level: string, category: string];
export const SAMPLE_PLAYERS: SamplePlayer[] = [
  ['Jordan Mbala', 19, 'Cameroun', 'Douala', 'Attaquant', 'ATT', 'Droit', '1,78 m', 'Semi-professionnel', 'D2'],
  ['Kevin Njoya', 21, 'Cameroun', 'Yaoundé', 'Milieu', 'MIL', 'Gauche', '1,76 m', 'Amateur', 'Senior'],
  ['Samuel Kouassi', 20, "Côte d'Ivoire", 'Abidjan', 'Défenseur', 'DEF', 'Droit', '1,86 m', 'Académie', 'U21'],
  ['David Tchana', 22, 'Sénégal', 'Dakar', 'Gardien', 'GAR', 'Droit', '1,91 m', 'Professionnel', 'Senior'],
  ['Idriss Nkou', 18, 'Cameroun', 'Garoua', 'Attaquant', 'ATT', 'Gauche', '1,80 m', 'Académie', 'U19'],
  ['Malick Diop', 20, 'Sénégal', 'Thiès', 'Milieu', 'MIL', 'Droit', '1,75 m', 'Semi-professionnel', 'Senior'],
  ['Emmanuel Asare', 17, 'Ghana', 'Accra', 'Défenseur', 'DEF', 'Gauche', '1,82 m', 'Académie', 'U17'],
  ['Chidi Okafor', 23, 'Nigeria', 'Lagos', 'Attaquant', 'ATT', 'Droit', '1,84 m', 'Professionnel', 'Senior'],
  ['Yannick Tamo', 19, 'Cameroun', 'Bafoussam', 'Milieu', 'MIL', 'Droit', '1,73 m', 'Amateur', 'U21'],
];

export type SampleAgent = [name: string, country: string, city: string, domains: string[], languages: string];
export const SAMPLE_AGENTS: SampleAgent[] = [
  ['Moussa Diallo', 'Sénégal', 'Dakar', ['Jeunes talents', 'Attaquants'], 'Français, Wolof'],
  ['Paul Etoundi', 'Cameroun', 'Douala', ['Jeunes talents', 'Défenseurs'], 'Français, Anglais'],
  ['Kofi Mensah', 'Ghana', 'Accra', ['Attaquants', 'Gardiens'], 'Anglais, Twi'],
  ['Aïcha Traoré', "Côte d'Ivoire", 'Abidjan', ['Jeunes talents', 'Gardiens'], 'Français, Dioula'],
  ['Ibrahim Bello', 'Nigeria', 'Lagos', ['Attaquants', 'Défenseurs'], 'Anglais, Haoussa'],
  ['Serge Fotso', 'Cameroun', 'Yaoundé', ['Défenseurs', 'Gardiens'], 'Français, Anglais'],
];

export type SampleClub = [name: string, type: string, city: string, description: string];
export const SAMPLE_CLUBS: SampleClub[] = [
  ['Académie des Rives', 'Académie', 'Douala', 'Formation U13 à U19'],
  ['FC Savane', 'Club', 'Garoua', 'Championnat régional'],
  ['Étoile du Nord', 'Club', 'Yaoundé', 'Équipe senior et U21'],
  ['Académie Horizon', 'Académie', 'Bafoussam', 'Pôle espoirs'],
  ['Union Littoral', 'Club', 'Douala', 'Équipe senior'],
  ['Centre Talents Sud', 'Académie', 'Kribi', 'Formation et détections'],
];

export type SampleVideo = [category: string, title: string, who: string, duration: string, colorIndex: number];
export const SAMPLE_VIDEOS: SampleVideo[] = [
  ['Buts', 'Frappe puissante du pied droit', 'Jordan M. · Attaquant · Cameroun', '00:42', 0],
  ['Skills', 'Série de dribbles dans la surface', 'Kevin N. · Milieu · Cameroun', '00:31', 1],
  ['Passes', 'Passe en profondeur parfaite', 'Malick D. · Milieu · Sénégal', '00:27', 2],
  ['Défense', 'Intervention défensive décisive', "Samuel K. · Défenseur · Côte d'Ivoire", '00:38', 3],
  ['Arrêts', 'Double arrêt spectaculaire', 'David T. · Gardien · Sénégal', '00:36', 4],
  ['Buts', 'Finition en une touche', 'Chidi O. · Attaquant · Nigeria', '00:29', 5],
];

export type SampleOpportunity = [type: string, title: string, text: string, place: string, date: string];
export const SAMPLE_OPPORTUNITIES: SampleOpportunity[] = [
  ['Détection', 'Détection U21 · Douala', 'Un club recherche 2 attaquants et 1 défenseur central, 18 à 21 ans.', 'Douala, Cameroun', 'Date à confirmer'],
  ['Essai', 'Essai joueurs semi-professionnels', 'Opportunité pour les joueurs évoluant au niveau régional ou national.', 'Yaoundé, Cameroun', 'Date à confirmer'],
  ['Académie', 'Recrutement jeunes joueurs', 'Une académie recrute de jeunes joueurs pour intégrer sa prochaine promotion.', 'Garoua, Cameroun', 'Date à confirmer'],
  ['Tournoi', 'Tournoi inter-académies', 'Un tournoi pour se montrer devant clubs et recruteurs.', 'Bafoussam, Cameroun', 'Date à confirmer'],
  ['Formation', 'Programme de formation', 'Un programme pour progresser sur le terrain et en dehors.', 'Douala, Cameroun', 'Date à confirmer'],
  ['Détection', 'Journée de recrutement gardiens', 'Un club cherche un gardien de but pour renforcer son effectif.', "Abidjan, Côte d'Ivoire", 'Date à confirmer'],
];
