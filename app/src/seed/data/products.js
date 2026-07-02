// Fiches produits riches destinées à MongoDB.
// Les SKU et prix correspondent au référentiel PostgreSQL (seed/sql/02-data.sql).
// L'intérêt du document : les `specs` changent totalement d'une catégorie à
// l'autre (écran/RAM pour un PC, tailles/matière pour un vêtement, ISBN pour
// un livre…) — impossible à modéliser proprement dans une table SQL unique.
// `quality` (1 à 5) sert à générer des avis cohérents avec la réputation du produit.

module.exports = [
  // ─── High-tech ────────────────────────────────────────────────────
  {
    sku: 'ELEC-0001', name: 'Smartphone Nova X5 128 Go', brand: 'Novatek',
    category: 'high-tech', subcategory: 'smartphones', price: 449.0, quality: 4.2,
    description: "Smartphone équilibré : écran AMOLED 120 Hz, photo 50 Mpx et deux jours d'autonomie.",
    tags: ['smartphone', '5G', 'android', 'amoled'],
    specs: {
      ecran: '6,5" AMOLED 120 Hz', stockage: '128 Go', ram: '8 Go',
      batterie: '5000 mAh', appareil_photo: '50 Mpx + 12 Mpx',
      connectivite: ['5G', 'NFC', 'Wi-Fi 6'], coloris: 'Noir graphite',
    },
  },
  {
    sku: 'ELEC-0002', name: 'Smartphone Nova X5 Pro 256 Go', brand: 'Novatek',
    category: 'high-tech', subcategory: 'smartphones', price: 699.0, quality: 4.5,
    description: 'La version Pro : téléobjectif ×3, charge 80 W et châssis aluminium.',
    tags: ['smartphone', '5G', 'android', 'haut-de-gamme'],
    specs: {
      ecran: '6,7" AMOLED LTPO 120 Hz', stockage: '256 Go', ram: '12 Go',
      batterie: '5100 mAh', appareil_photo: '50 Mpx + 48 Mpx (télé ×3) + 12 Mpx',
      connectivite: ['5G', 'NFC', 'Wi-Fi 7'], charge: '80 W filaire', coloris: 'Bleu nuit',
    },
  },
  {
    sku: 'ELEC-0003', name: 'Casque sans fil SoundMax Q30', brand: 'SoundMax',
    category: 'high-tech', subcategory: 'audio', price: 89.9, quality: 4.4,
    description: 'Réduction de bruit active et 40 h d’autonomie pour un prix contenu.',
    tags: ['casque', 'bluetooth', 'anc', 'audio'],
    specs: {
      type: 'circum-aural fermé', reduction_bruit: true, autonomie_heures: 40,
      bluetooth: '5.3', multipoint: true, poids_grammes: 250,
    },
  },
  {
    sku: 'ELEC-0004', name: 'Enceinte Bluetooth BoomGo Mini', brand: 'BoomGo',
    category: 'high-tech', subcategory: 'audio', price: 39.99, quality: 3.9,
    description: 'Enceinte nomade étanche IPX7, parfaite pour la douche ou le camping.',
    tags: ['enceinte', 'bluetooth', 'etanche', 'nomade'],
    specs: {
      puissance_watts: 10, etancheite: 'IPX7', autonomie_heures: 14,
      bluetooth: '5.1', poids_grammes: 320,
    },
  },
  {
    sku: 'ELEC-0005', name: 'Montre connectée FitPulse 2', brand: 'FitPulse',
    category: 'high-tech', subcategory: 'wearables', price: 129.0, quality: 4.0,
    description: 'Suivi cardio, GPS intégré et 10 jours d’autonomie réelle.',
    tags: ['montre', 'sport', 'gps', 'cardio'],
    specs: {
      ecran: '1,43" AMOLED', gps: true, capteurs: ['cardio', 'SpO2', 'sommeil'],
      autonomie_jours: 10, etancheite: '5 ATM', compatibilite: ['Android', 'iOS'],
    },
  },
  {
    sku: 'ELEC-0006', name: 'Tablette Slate 11" 64 Go', brand: 'Novatek',
    category: 'high-tech', subcategory: 'tablettes', price: 329.0, quality: 3.8,
    description: 'Tablette familiale 11 pouces : streaming, cours en ligne et jeux légers.',
    tags: ['tablette', 'android', 'famille'],
    specs: {
      ecran: '11" LCD 90 Hz', stockage: '64 Go extensible microSD', ram: '6 Go',
      batterie: '8000 mAh', haut_parleurs: 4,
    },
  },
  {
    sku: 'ELEC-0007', name: 'Écouteurs true wireless AirBuds S', brand: 'SoundMax',
    category: 'high-tech', subcategory: 'audio', price: 59.9, quality: 4.1,
    description: 'Écouteurs compacts avec réduction de bruit et boîtier charge rapide.',
    tags: ['ecouteurs', 'bluetooth', 'anc', 'sport'],
    specs: {
      reduction_bruit: true, autonomie_heures: 7, autonomie_avec_boitier: 28,
      bluetooth: '5.3', etancheite: 'IPX4',
    },
  },
  {
    sku: 'ELEC-0008', name: 'TV LED 55" 4K CrystalView', brand: 'CrystalView',
    category: 'high-tech', subcategory: 'tv', price: 499.0, quality: 4.0,
    description: 'TV 4K HDR 55 pouces avec système connecté et trois ports HDMI 2.1.',
    tags: ['tv', '4k', 'hdr', 'salon'],
    specs: {
      diagonale: '55" (139 cm)', resolution: '3840 × 2160', hdr: ['HDR10+', 'Dolby Vision'],
      hdmi: 3, systeme: 'CrystalOS', classe_energie: 'F',
    },
  },

  // ─── Informatique ────────────────────────────────────────────────
  {
    sku: 'INFO-0001', name: 'PC portable UltraBook 14" i5 16 Go', brand: 'Zenix',
    category: 'informatique', subcategory: 'ordinateurs-portables', price: 899.0, quality: 4.3,
    description: 'Ultraportable 1,2 kg pour les études et le télétravail, 12 h d’autonomie.',
    tags: ['pc-portable', 'ultrabook', 'bureautique', 'etudiant'],
    specs: {
      processeur: 'Intel Core i5-1340P', ram: '16 Go DDR5', stockage: 'SSD 512 Go NVMe',
      ecran: '14" IPS 1920 × 1200', poids_kg: 1.2, autonomie_heures: 12, os: 'Windows 11',
    },
  },
  {
    sku: 'INFO-0002', name: 'PC portable gamer Raptor 15" RTX', brand: 'Zenix',
    category: 'informatique', subcategory: 'ordinateurs-portables', price: 1499.0, quality: 4.4,
    description: 'Machine de jeu : RTX 4070, écran 165 Hz et refroidissement double turbine.',
    tags: ['pc-portable', 'gaming', 'rtx', '165hz'],
    specs: {
      processeur: 'AMD Ryzen 7 7840HS', gpu: 'NVIDIA RTX 4070 8 Go', ram: '32 Go DDR5',
      stockage: 'SSD 1 To NVMe', ecran: '15,6" IPS QHD 165 Hz', poids_kg: 2.3, os: 'Windows 11',
    },
  },
  {
    sku: 'INFO-0003', name: 'Souris sans fil ErgoClick', brand: 'ErgoClick',
    category: 'informatique', subcategory: 'peripheriques', price: 24.9, quality: 4.0,
    description: 'Souris silencieuse ergonomique, 18 mois d’autonomie sur une pile AA.',
    tags: ['souris', 'sans-fil', 'ergonomie', 'bureautique'],
    specs: {
      capteur_dpi: 1600, boutons: 6, connexion: ['USB-A 2,4 GHz', 'Bluetooth'],
      silencieuse: true, autonomie_mois: 18,
    },
  },
  {
    sku: 'INFO-0004', name: 'Clavier mécanique TKL RGB', brand: 'KeyForge',
    category: 'informatique', subcategory: 'peripheriques', price: 79.9, quality: 4.2,
    description: 'Clavier mécanique compact (sans pavé numérique), switches rouges et RGB par touche.',
    tags: ['clavier', 'mecanique', 'gaming', 'rgb'],
    specs: {
      format: 'TKL (87 touches)', switches: 'linéaires rouges', retroeclairage: 'RGB par touche',
      chassis: 'aluminium', cable: 'USB-C détachable', disposition: 'AZERTY',
    },
  },
  {
    sku: 'INFO-0005', name: 'Écran 27" QHD 165 Hz', brand: 'CrystalView',
    category: 'informatique', subcategory: 'ecrans', price: 269.0, quality: 4.3,
    description: 'Dalle IPS QHD 165 Hz compatible FreeSync/G-Sync, pied réglable en hauteur.',
    tags: ['ecran', 'qhd', '165hz', 'gaming'],
    specs: {
      diagonale: '27"', resolution: '2560 × 1440', dalle: 'IPS', frequence_hz: 165,
      temps_reponse_ms: 1, synchronisation: ['FreeSync Premium', 'G-Sync Compatible'],
    },
  },
  {
    sku: 'INFO-0006', name: 'SSD NVMe 1 To TurboDrive', brand: 'TurboDrive',
    category: 'informatique', subcategory: 'composants', price: 84.9, quality: 4.6,
    description: 'SSD PCIe 4.0 jusqu’à 7000 Mo/s, idéal pour donner une seconde vie à un PC.',
    tags: ['ssd', 'nvme', 'stockage', 'composant'],
    specs: {
      capacite: '1 To', interface: 'PCIe 4.0 ×4', lecture_mo_s: 7000, ecriture_mo_s: 5500,
      format: 'M.2 2280', endurance_tbw: 600, garantie_ans: 5,
    },
  },
  {
    sku: 'INFO-0007', name: 'Webcam Full HD StreamCam', brand: 'StreamCam',
    category: 'informatique', subcategory: 'peripheriques', price: 49.9, quality: 3.7,
    description: 'Webcam 1080p 60 ips avec micro stéréo et cache confidentialité.',
    tags: ['webcam', 'streaming', 'visio', 'teletravail'],
    specs: {
      resolution: '1920 × 1080 à 60 ips', mise_au_point: 'automatique',
      micro: 'stéréo', fixation: 'pince + pas de vis 1/4"', cache_confidentialite: true,
    },
  },

  // ─── Mode ────────────────────────────────────────────────────────
  {
    sku: 'MODE-0001', name: 'T-shirt coton bio unisexe', brand: 'UrbanWear',
    category: 'mode', subcategory: 'hauts', price: 19.9, quality: 4.1,
    description: 'T-shirt 100 % coton biologique, coupe droite, fabriqué au Portugal.',
    tags: ['t-shirt', 'coton-bio', 'unisexe', 'basique'],
    specs: { matiere: '100 % coton biologique', grammage: '180 g/m²', entretien: 'lavage 30 °C', origine: 'Portugal' },
    variants: [
      { taille: 'S', couleur: 'blanc' }, { taille: 'M', couleur: 'blanc' },
      { taille: 'L', couleur: 'blanc' }, { taille: 'M', couleur: 'noir' },
      { taille: 'L', couleur: 'noir' }, { taille: 'XL', couleur: 'noir' },
      { taille: 'M', couleur: 'vert sauge' },
    ],
  },
  {
    sku: 'MODE-0002', name: 'Jean slim stretch homme', brand: 'UrbanWear',
    category: 'mode', subcategory: 'pantalons', price: 49.9, quality: 3.9,
    description: 'Jean slim confortable grâce à 2 % d’élasthanne, délavage moyen.',
    tags: ['jean', 'slim', 'homme'],
    specs: { matiere: '98 % coton, 2 % élasthanne', coupe: 'slim', delavage: 'moyen', entretien: 'lavage 30 °C' },
    variants: [
      { taille: 'W30 L32' }, { taille: 'W32 L32' }, { taille: 'W32 L34' },
      { taille: 'W34 L32' }, { taille: 'W36 L34' },
    ],
  },
  {
    sku: 'MODE-0003', name: 'Sneakers Runner Flex', brand: 'StrideOne',
    category: 'mode', subcategory: 'chaussures', price: 79.9, quality: 4.3,
    description: 'Sneakers légères en mesh recyclé, semelle amortissante pour un usage quotidien.',
    tags: ['sneakers', 'baskets', 'running', 'recycle'],
    specs: { tige: 'mesh recyclé', semelle: 'mousse EVA', poids_grammes: 240, usage: 'ville / marche' },
    variants: [
      { pointure: 39 }, { pointure: 40 }, { pointure: 41 }, { pointure: 42 },
      { pointure: 43 }, { pointure: 44 }, { pointure: 45 },
    ],
  },
  {
    sku: 'MODE-0004', name: 'Veste imperméable trek', brand: 'NordicTrail',
    category: 'mode', subcategory: 'vestes', price: 119.0, quality: 4.4,
    description: 'Veste 3 couches imperméable 20 000 mm, coutures étanchées, capuche ajustable.',
    tags: ['veste', 'impermeable', 'randonnee', 'outdoor'],
    specs: {
      impermeabilite_mm: 20000, respirabilite: '15 000 g/m²/24 h',
      coutures_etanchees: true, poches: 4, poids_grammes: 380,
    },
    variants: [{ taille: 'S' }, { taille: 'M' }, { taille: 'L' }, { taille: 'XL' }],
  },
  {
    sku: 'MODE-0005', name: "Robe d'été fleurie", brand: 'Bellamode',
    category: 'mode', subcategory: 'robes', price: 39.9, quality: 3.6,
    description: 'Robe légère en viscose à motif floral, longueur midi.',
    tags: ['robe', 'ete', 'fleuri', 'femme'],
    specs: { matiere: '100 % viscose', longueur: 'midi', motif: 'floral', entretien: 'lavage main conseillé' },
    variants: [{ taille: '36' }, { taille: '38' }, { taille: '40' }, { taille: '42' }],
  },
  {
    sku: 'MODE-0006', name: 'Sac à dos urbain 20 L', brand: 'NordicTrail',
    category: 'mode', subcategory: 'accessoires', price: 44.9, quality: 4.2,
    description: 'Sac à dos déperlant avec compartiment ordinateur 15" et port USB externe.',
    tags: ['sac', 'urbain', 'ordinateur', 'voyage'],
    specs: {
      volume_litres: 20, compartiment_pc: '15,6"', deperlant: true,
      port_usb: true, poches: 6,
    },
  },

  // ─── Maison & électroménager ─────────────────────────────────────
  {
    sku: 'MAIS-0001', name: 'Machine à café expresso broyeur', brand: 'BaristaPro',
    category: 'maison', subcategory: 'petit-dejeuner', price: 349.0, quality: 4.5,
    description: 'Expresso broyeur avec mousseur à lait : du grain à la tasse en 30 secondes.',
    tags: ['cafe', 'expresso', 'broyeur', 'cuisine'],
    specs: {
      pression_bars: 15, capacite_reservoir_l: 1.8, broyeur: 'céramique 13 positions',
      mousseur_lait: true, puissance_watts: 1450, programmes: 8,
    },
  },
  {
    sku: 'MAIS-0002', name: 'Aspirateur robot CleanBot S9', brand: 'CleanBot',
    category: 'maison', subcategory: 'entretien', price: 299.0, quality: 4.0,
    description: 'Robot aspirateur avec cartographie laser, retour à la base et application mobile.',
    tags: ['aspirateur', 'robot', 'domotique', 'menage'],
    specs: {
      aspiration_pa: 4000, navigation: 'LiDAR', autonomie_minutes: 150,
      reservoir_ml: 400, application: true, compatible: ['Alexa', 'Google Home'],
    },
  },
  {
    sku: 'MAIS-0003', name: 'Friteuse sans huile AirCrisp 5 L', brand: 'AirCrisp',
    category: 'maison', subcategory: 'cuisson', price: 99.9, quality: 4.3,
    description: 'Friteuse à air chaud 5 L : frites croustillantes avec une cuillère d’huile.',
    tags: ['friteuse', 'airfryer', 'cuisine', 'sans-huile'],
    specs: {
      capacite_l: 5, puissance_watts: 1700, temperature_max: 200,
      programmes: 8, panier_lave_vaisselle: true,
    },
  },
  {
    sku: 'MAIS-0004', name: 'Bouilloire inox 1,7 L', brand: 'HomeLux',
    category: 'maison', subcategory: 'petit-dejeuner', price: 29.9, quality: 3.8,
    description: 'Bouilloire inox à température réglable (60–100 °C) avec maintien au chaud.',
    tags: ['bouilloire', 'the', 'cuisine'],
    specs: {
      capacite_l: 1.7, puissance_watts: 2200, temperatures: [60, 70, 80, 90, 100],
      maintien_chaud: true, materiau: 'inox brossé',
    },
  },
  {
    sku: 'MAIS-0005', name: 'Lampe de bureau LED', brand: 'HomeLux',
    category: 'maison', subcategory: 'luminaires', price: 22.9, quality: 3.9,
    description: 'Lampe articulée à intensité variable, port USB et minuterie.',
    tags: ['lampe', 'bureau', 'led', 'teletravail'],
    specs: {
      puissance_watts: 9, temperatures_couleur: ['3000 K', '4500 K', '6000 K'],
      intensites: 5, port_usb: true, minuterie: true,
    },
  },
  {
    sku: 'MAIS-0006', name: 'Set 3 casseroles induction', brand: 'HomeLux',
    category: 'maison', subcategory: 'cuisson', price: 59.9, quality: 4.1,
    description: 'Casseroles 16/18/20 cm tous feux dont induction, revêtement sans PFOA.',
    tags: ['casseroles', 'induction', 'cuisine'],
    specs: {
      diametres_cm: [16, 18, 20], compatible_induction: true,
      revetement: 'anti-adhésif sans PFOA', poignees: 'amovibles',
    },
  },

  // ─── Livres ──────────────────────────────────────────────────────
  {
    sku: 'LIVR-0001', name: 'Bases de données NoSQL — le guide', brand: 'Éditions TechPress',
    category: 'livres', subcategory: 'informatique', price: 34.9, quality: 4.6,
    description: 'Panorama complet des bases documents, clé-valeur, colonnes et graphes, avec études de cas.',
    tags: ['nosql', 'informatique', 'bases-de-donnees', 'technique'],
    specs: {
      auteur: 'Marc Duret', isbn: '978-2-4093-1204-7', pages: 384,
      editeur: 'TechPress', langue: 'français', format: 'broché', parution: 2025,
    },
  },
  {
    sku: 'LIVR-0002', name: 'Roman « La Cité des marées »', brand: 'Éditions Horizon',
    category: 'livres', subcategory: 'romans', price: 21.9, quality: 4.2,
    description: 'Fresque d’anticipation dans une ville portuaire submergée — prix des libraires 2025.',
    tags: ['roman', 'anticipation', 'litterature'],
    specs: {
      auteur: 'Claire Vasseur', isbn: '978-2-8817-0452-3', pages: 512,
      editeur: 'Horizon', langue: 'français', format: 'broché', parution: 2025,
    },
  },
  {
    sku: 'LIVR-0003', name: "BD « Les Chroniques d'Aldara T.1 »", brand: 'Éditions Bulles',
    category: 'livres', subcategory: 'bande-dessinee', price: 14.5, quality: 4.4,
    description: 'Premier tome d’une saga de fantasy dessinée à l’aquarelle.',
    tags: ['bd', 'fantasy', 'aquarelle'],
    specs: {
      scenariste: 'Théo Lambert', dessinatrice: 'Awa Diallo',
      isbn: '978-2-3654-7789-1', pages: 64, format: 'cartonné 24 × 32 cm', tome: 1,
    },
  },
  {
    sku: 'LIVR-0004', name: 'Cuisine de saison en 30 minutes', brand: 'Éditions Gourmand',
    category: 'livres', subcategory: 'cuisine', price: 24.9, quality: 4.0,
    description: '80 recettes de saison prêtes en une demi-heure, photos pas à pas.',
    tags: ['cuisine', 'recettes', 'saison'],
    specs: {
      auteure: 'Sophie Renard', isbn: '978-2-1177-3390-8', pages: 192,
      recettes: 80, format: 'relié', parution: 2024,
    },
  },

  // ─── Jeux & loisirs ──────────────────────────────────────────────
  {
    sku: 'JEUX-0001', name: 'Console NeoStation 5 1 To', brand: 'NeoPlay',
    category: 'jeux-loisirs', subcategory: 'consoles', price: 549.0, quality: 4.7,
    description: 'Console nouvelle génération : SSD 1 To, 4K 120 ips, ray tracing.',
    tags: ['console', 'gaming', '4k', 'salon'],
    specs: {
      stockage: 'SSD 1 To', resolution_max: '4K 120 ips', ray_tracing: true,
      retrocompatibilite: true, manette_incluse: 1, lecteur_disque: true,
    },
  },
  {
    sku: 'JEUX-0002', name: 'Manette sans fil NeoPad', brand: 'NeoPlay',
    category: 'jeux-loisirs', subcategory: 'accessoires-gaming', price: 64.9, quality: 4.3,
    description: 'Manette officielle avec retour haptique et gâchettes adaptatives.',
    tags: ['manette', 'gaming', 'accessoire'],
    specs: {
      retour_haptique: true, gachettes_adaptatives: true, autonomie_heures: 12,
      connexion: ['sans fil', 'USB-C'], coloris: 'blanc glacier',
    },
  },
  {
    sku: 'JEUX-0003', name: 'Jeu « Legends of Kyra » (NS5)', brand: 'NeoPlay Studios',
    category: 'jeux-loisirs', subcategory: 'jeux-video', price: 69.9, quality: 4.5,
    description: 'Action-RPG en monde ouvert, exclusivité NeoStation 5 — édition standard.',
    tags: ['jeu-video', 'rpg', 'monde-ouvert', 'exclusivite'],
    specs: {
      plateforme: 'NeoStation 5', genre: 'action-RPG', pegi: 16,
      joueurs: '1 (en ligne 2-4)', langues: ['français', 'anglais'], support: 'disque',
    },
  },
  {
    sku: 'JEUX-0004', name: 'Puzzle 1000 pièces Aurores boréales', brand: 'PuzzLo',
    category: 'jeux-loisirs', subcategory: 'puzzles', price: 18.9, quality: 4.1,
    description: 'Puzzle photo 1000 pièces en carton recyclé, poster d’aide inclus.',
    tags: ['puzzle', 'detente', 'famille'],
    specs: {
      pieces: 1000, dimensions_cm: '70 × 50', age_minimum: 12,
      carton_recycle: true, poster_inclus: true,
    },
  },
  {
    sku: 'JEUX-0005', name: 'Jeu de société « Colons de Meridia »', brand: 'LudoFab',
    category: 'jeux-loisirs', subcategory: 'jeux-de-societe', price: 42.9, quality: 4.6,
    description: 'Jeu de stratégie et de négociation — As d’or 2024, règles apprises en 15 minutes.',
    tags: ['jeu-de-societe', 'strategie', 'famille', 'soiree'],
    specs: {
      joueurs: '3-4 (extension 5-6)', duree_minutes: 75, age_minimum: 10,
      recompense: "As d'or 2024", langue: 'français',
    },
  },

  // ─── Sport ───────────────────────────────────────────────────────
  {
    sku: 'SPOR-0001', name: 'Tapis de yoga antidérapant', brand: 'ZenFit',
    category: 'sport', subcategory: 'fitness', price: 27.9, quality: 4.2,
    description: 'Tapis 6 mm en TPE recyclable, double face antidérapante, sangle de transport.',
    tags: ['yoga', 'fitness', 'tapis', 'bien-etre'],
    specs: {
      epaisseur_mm: 6, dimensions_cm: '183 × 61', matiere: 'TPE recyclable',
      antiderapant: 'double face', sangle_incluse: true, poids_kg: 0.9,
    },
  },
  {
    sku: 'SPOR-0002', name: 'Haltères réglables 2 × 10 kg', brand: 'IronCore',
    category: 'sport', subcategory: 'musculation', price: 89.9, quality: 4.4,
    description: 'Paire d’haltères réglables de 2,5 à 10 kg par cran de 2,5 kg — gain de place garanti.',
    tags: ['halteres', 'musculation', 'fitness', 'maison'],
    specs: {
      poids_min_kg: 2.5, poids_max_kg: 10, increment_kg: 2.5,
      systeme: 'molette de sélection', revetement: 'fonte + néoprène',
    },
  },
  {
    sku: 'SPOR-0003', name: "Vélo d'appartement compact", brand: 'IronCore',
    category: 'sport', subcategory: 'cardio', price: 249.0, quality: 3.9,
    description: 'Vélo pliable à résistance magnétique 8 niveaux, console avec cardio.',
    tags: ['velo', 'cardio', 'fitness', 'appartement'],
    specs: {
      resistance: 'magnétique 8 niveaux', pliable: true, poids_max_utilisateur_kg: 110,
      console: ['vitesse', 'distance', 'calories', 'cardio'], poids_kg: 18,
    },
  },
  {
    sku: 'SPOR-0004', name: 'Gourde isotherme 750 ml', brand: 'ZenFit',
    category: 'sport', subcategory: 'accessoires', price: 19.9, quality: 4.5,
    description: 'Gourde inox double paroi : 12 h chaud, 24 h froid, sans BPA.',
    tags: ['gourde', 'isotherme', 'randonnee', 'ecologie'],
    specs: {
      capacite_ml: 750, isolation: 'double paroi sous vide', chaud_heures: 12,
      froid_heures: 24, sans_bpa: true, lave_vaisselle: false,
    },
  },
];
