-- ====================================================================
--  Marketplace — jeu de données PostgreSQL
--  Vendeurs, clients, adresses, référentiel produits, stock, puis
--  150 commandes générées de façon DÉTERMINISTE (setseed) sur les
--  6 derniers mois, avec des « paniers types » pour donner du sens
--  aux recommandations Neo4j et au classement Redis.
-- ====================================================================

SELECT setseed(0.42);

-- ─── Vendeurs de la marketplace ─────────────────────────────────────
INSERT INTO sellers (name, email, commission_rate) VALUES
  ('TechDistrib',         'contact@techdistrib.fr',        0.120),
  ('ModeExpress',         'pro@modeexpress.fr',            0.150),
  ('Maison+',             'vendeur@maisonplus.fr',         0.100),
  ('Librairie du Centre', 'commandes@librairieducentre.fr',0.080),
  ('LudiShop',            'hello@ludishop.fr',             0.120),
  ('SportZone',           'b2b@sportzone.fr',              0.100);

-- ─── Clients ────────────────────────────────────────────────────────
INSERT INTO customers (email, first_name, last_name, phone) VALUES
  ('camille.durand@example.com',   'Camille',  'Durand',    '0612345601'),
  ('lucas.moreau@example.com',     'Lucas',    'Moreau',    '0612345602'),
  ('lea.bernard@example.com',      'Léa',      'Bernard',   '0612345603'),
  ('hugo.petit@example.com',       'Hugo',     'Petit',     '0612345604'),
  ('emma.robert@example.com',      'Emma',     'Robert',    '0612345605'),
  ('nathan.richard@example.com',   'Nathan',   'Richard',   '0612345606'),
  ('chloe.dubois@example.com',     'Chloé',    'Dubois',    '0612345607'),
  ('louis.garcia@example.com',     'Louis',    'Garcia',    '0612345608'),
  ('manon.martinez@example.com',   'Manon',    'Martinez',  '0612345609'),
  ('jules.laurent@example.com',    'Jules',    'Laurent',   '0612345610'),
  ('ines.simon@example.com',       'Inès',     'Simon',     '0612345611'),
  ('gabriel.michel@example.com',   'Gabriel',  'Michel',    '0612345612'),
  ('jade.lefevre@example.com',     'Jade',     'Lefèvre',   '0612345613'),
  ('adam.leroy@example.com',       'Adam',     'Leroy',     '0612345614'),
  ('lina.roux@example.com',        'Lina',     'Roux',      '0612345615'),
  ('theo.david@example.com',       'Théo',     'David',     '0612345616'),
  ('zoe.bertrand@example.com',     'Zoé',      'Bertrand',  '0612345617'),
  ('raphael.morel@example.com',    'Raphaël',  'Morel',     '0612345618'),
  ('alice.fournier@example.com',   'Alice',    'Fournier',  '0612345619'),
  ('ethan.girard@example.com',     'Ethan',    'Girard',    '0612345620');

-- ─── Adresses (une adresse de livraison par client, parfois une de facturation)
INSERT INTO addresses (customer_id, type, line1, zip_code, city) VALUES
  ( 1, 'livraison',    '12 rue de la Paix',        '75002', 'Paris'),
  ( 2, 'livraison',    '8 avenue Jean Jaurès',     '69007', 'Lyon'),
  ( 3, 'livraison',    '3 place du Capitole',      '31000', 'Toulouse'),
  ( 4, 'livraison',    '27 rue du Vieux Port',     '13001', 'Marseille'),
  ( 5, 'livraison',    '5 rue Crébillon',          '44000', 'Nantes'),
  ( 6, 'livraison',    '14 rue des Carmes',        '51100', 'Reims'),
  ( 7, 'livraison',    '9 quai des Chartrons',     '33000', 'Bordeaux'),
  ( 8, 'livraison',    '21 rue de la Soif',        '35000', 'Rennes'),
  ( 9, 'livraison',    '2 place Stanislas',        '54000', 'Nancy'),
  (10, 'livraison',    '18 rue de la République',  '69002', 'Lyon'),
  (11, 'livraison',    '31 boulevard Gambetta',    '06000', 'Nice'),
  (12, 'livraison',    '7 rue des Tanneurs',       '67000', 'Strasbourg'),
  (13, 'livraison',    '44 rue Nationale',         '59000', 'Lille'),
  (14, 'livraison',    '6 rue du Palais',          '86000', 'Poitiers'),
  (15, 'livraison',    '11 avenue Foch',           '57000', 'Metz'),
  (16, 'livraison',    '25 rue Saint-Guilhem',     '34000', 'Montpellier'),
  (17, 'livraison',    '4 rue des Forges',         '21000', 'Dijon'),
  (18, 'livraison',    '16 rue Jeanne d''Arc',     '76000', 'Rouen'),
  (19, 'livraison',    '9 rue des Halles',         '37000', 'Tours'),
  (20, 'livraison',    '2 rue Victor Hugo',        '38000', 'Grenoble'),
  ( 1, 'facturation',  '110 rue de Rivoli',        '75001', 'Paris'),
  ( 4, 'facturation',  '1 chemin des Oliviers',    '13008', 'Marseille'),
  ( 9, 'facturation',  '80 avenue de Lattre',      '54500', 'Vandœuvre'),
  (13, 'facturation',  '3 rue Faidherbe',          '59800', 'Lille');

-- ─── Référentiel produits (la fiche riche vit dans MongoDB, même SKU) ─
INSERT INTO products (sku, name, category, seller_id, price_cents, vat_rate) VALUES
  -- High-tech (vendeur TechDistrib)
  ('ELEC-0001', 'Smartphone Nova X5 128 Go',              'high-tech',     1,  44900, 0.200),
  ('ELEC-0002', 'Smartphone Nova X5 Pro 256 Go',          'high-tech',     1,  69900, 0.200),
  ('ELEC-0003', 'Casque sans fil SoundMax Q30',           'high-tech',     1,   8990, 0.200),
  ('ELEC-0004', 'Enceinte Bluetooth BoomGo Mini',         'high-tech',     1,   3999, 0.200),
  ('ELEC-0005', 'Montre connectée FitPulse 2',            'high-tech',     1,  12900, 0.200),
  ('ELEC-0006', 'Tablette Slate 11" 64 Go',               'high-tech',     1,  32900, 0.200),
  ('ELEC-0007', 'Écouteurs true wireless AirBuds S',      'high-tech',     1,   5990, 0.200),
  ('ELEC-0008', 'TV LED 55" 4K CrystalView',              'high-tech',     1,  49900, 0.200),
  -- Informatique (TechDistrib)
  ('INFO-0001', 'PC portable UltraBook 14" i5 16 Go',     'informatique',  1,  89900, 0.200),
  ('INFO-0002', 'PC portable gamer Raptor 15" RTX',       'informatique',  1, 149900, 0.200),
  ('INFO-0003', 'Souris sans fil ErgoClick',              'informatique',  1,   2490, 0.200),
  ('INFO-0004', 'Clavier mécanique TKL RGB',              'informatique',  1,   7990, 0.200),
  ('INFO-0005', 'Écran 27" QHD 165 Hz',                   'informatique',  1,  26900, 0.200),
  ('INFO-0006', 'SSD NVMe 1 To TurboDrive',               'informatique',  1,   8490, 0.200),
  ('INFO-0007', 'Webcam Full HD StreamCam',               'informatique',  1,   4990, 0.200),
  -- Mode (ModeExpress)
  ('MODE-0001', 'T-shirt coton bio unisexe',              'mode',          2,   1990, 0.200),
  ('MODE-0002', 'Jean slim stretch homme',                'mode',          2,   4990, 0.200),
  ('MODE-0003', 'Sneakers Runner Flex',                   'mode',          2,   7990, 0.200),
  ('MODE-0004', 'Veste imperméable trek',                 'mode',          2,  11900, 0.200),
  ('MODE-0005', 'Robe d''été fleurie',                    'mode',          2,   3990, 0.200),
  ('MODE-0006', 'Sac à dos urbain 20 L',                  'mode',          2,   4490, 0.200),
  -- Maison & électroménager (Maison+)
  ('MAIS-0001', 'Machine à café expresso broyeur',        'maison',        3,  34900, 0.200),
  ('MAIS-0002', 'Aspirateur robot CleanBot S9',           'maison',        3,  29900, 0.200),
  ('MAIS-0003', 'Friteuse sans huile AirCrisp 5 L',       'maison',        3,   9990, 0.200),
  ('MAIS-0004', 'Bouilloire inox 1,7 L',                  'maison',        3,   2990, 0.200),
  ('MAIS-0005', 'Lampe de bureau LED',                    'maison',        3,   2290, 0.200),
  ('MAIS-0006', 'Set 3 casseroles induction',             'maison',        3,   5990, 0.200),
  -- Livres (Librairie du Centre — TVA réduite 5,5 %)
  ('LIVR-0001', 'Bases de données NoSQL — le guide',      'livres',        4,   3490, 0.055),
  ('LIVR-0002', 'Roman « La Cité des marées »',           'livres',        4,   2190, 0.055),
  ('LIVR-0003', 'BD « Les Chroniques d''Aldara T.1 »',    'livres',        4,   1450, 0.055),
  ('LIVR-0004', 'Cuisine de saison en 30 minutes',        'livres',        4,   2490, 0.055),
  -- Jeux & loisirs (LudiShop)
  ('JEUX-0001', 'Console NeoStation 5 1 To',              'jeux-loisirs',  5,  54900, 0.200),
  ('JEUX-0002', 'Manette sans fil NeoPad',                'jeux-loisirs',  5,   6490, 0.200),
  ('JEUX-0003', 'Jeu « Legends of Kyra » (NS5)',          'jeux-loisirs',  5,   6990, 0.200),
  ('JEUX-0004', 'Puzzle 1000 pièces Aurores boréales',    'jeux-loisirs',  5,   1890, 0.200),
  ('JEUX-0005', 'Jeu de société « Colons de Meridia »',   'jeux-loisirs',  5,   4290, 0.200),
  -- Sport (SportZone)
  ('SPOR-0001', 'Tapis de yoga antidérapant',             'sport',         6,   2790, 0.200),
  ('SPOR-0002', 'Haltères réglables 2 × 10 kg',           'sport',         6,   8990, 0.200),
  ('SPOR-0003', 'Vélo d''appartement compact',            'sport',         6,  24900, 0.200),
  ('SPOR-0004', 'Gourde isotherme 750 ml',                'sport',         6,   1990, 0.200);

-- ─── Stock initial (déterministe grâce au setseed ci-dessus) ────────
INSERT INTO stock (product_id, quantity)
SELECT id, 20 + floor(random() * 180)::int FROM products;

-- Une rupture de stock volontaire pour tester le refus de commande.
UPDATE stock SET quantity = 0
 WHERE product_id = (SELECT id FROM products WHERE sku = 'MODE-0005');

-- ─── Génération de 150 commandes réalistes sur 6 mois ───────────────
DO $$
DECLARE
  v_customer_count INT;
  v_customer_id    INT;
  v_address_id     INT;
  v_order_id       INT;
  v_date           TIMESTAMPTZ;
  v_status         order_status;
  v_r              DOUBLE PRECISION;
  v_total_cents    BIGINT;
  v_method         payment_method;
  -- « paniers types » : produits fréquemment achetés ensemble.
  -- C'est ce qui donne du signal aux recommandations Neo4j.
  v_bundles JSONB := '[
    ["JEUX-0001", "JEUX-0002", "JEUX-0003"],
    ["ELEC-0001", "ELEC-0003"],
    ["ELEC-0002", "ELEC-0007", "ELEC-0005"],
    ["INFO-0001", "INFO-0003", "INFO-0006"],
    ["INFO-0002", "INFO-0004", "INFO-0005"],
    ["SPOR-0001", "SPOR-0004"],
    ["MAIS-0001", "MAIS-0004"],
    ["MODE-0003", "MODE-0001"],
    ["LIVR-0001", "INFO-0007"]
  ]';
  v_bundle JSONB;
  v_sku    TEXT;
  i INT; j INT;
BEGIN
  PERFORM setseed(0.42);
  SELECT count(*) INTO v_customer_count FROM customers;

  FOR i IN 1..150 LOOP
    v_customer_id := 1 + floor(random() * v_customer_count)::int;
    SELECT id INTO v_address_id
      FROM addresses
     WHERE customer_id = v_customer_id AND type = 'livraison'
     LIMIT 1;

    v_date := now() - (random() * 180 || ' days')::interval;
    v_r := random();
    v_status := CASE
      WHEN v_r < 0.05 THEN 'annulee'::order_status
      WHEN v_r < 0.13 THEN 'en_attente'::order_status
      WHEN v_r < 0.30 THEN 'payee'::order_status
      WHEN v_r < 0.60 THEN 'expediee'::order_status
      ELSE                 'livree'::order_status
    END;

    INSERT INTO orders (customer_id, shipping_address_id, status, ordered_at)
    VALUES (v_customer_id, v_address_id, v_status, v_date)
    RETURNING id INTO v_order_id;

    IF random() < 0.45 THEN
      -- Commande « panier type » : chaque article du lot a 80 % de
      -- chances d'être présent (le premier l'est toujours).
      v_bundle := v_bundles -> floor(random() * jsonb_array_length(v_bundles))::int;
      FOR j IN 0..jsonb_array_length(v_bundle) - 1 LOOP
        IF j = 0 OR random() < 0.8 THEN
          v_sku := v_bundle ->> j;
          INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
          SELECT v_order_id, p.id, 1, p.price_cents
            FROM products p WHERE p.sku = v_sku
          ON CONFLICT (order_id, product_id) DO NOTHING;
        END IF;
      END LOOP;
    ELSE
      -- Commande aléatoire de 1 à 3 produits.
      FOR j IN 1..(1 + floor(random() * 3)::int) LOOP
        INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
        SELECT v_order_id, p.id, 1 + floor(random() * 2)::int, p.price_cents
          FROM products p ORDER BY random() LIMIT 1
        ON CONFLICT (order_id, product_id)
          DO UPDATE SET quantity = order_items.quantity + EXCLUDED.quantity;
      END LOOP;
    END IF;

    -- Paiement accepté + facture pour toute commande réglée.
    IF v_status IN ('payee', 'expediee', 'livree') THEN
      SELECT COALESCE(SUM(quantity * unit_price_cents), 0)
        INTO v_total_cents
        FROM order_items WHERE order_id = v_order_id;

      v_method := (ARRAY['carte','carte','carte','paypal','virement']::payment_method[])
                  [1 + floor(random() * 5)::int];

      INSERT INTO payments (order_id, method, status, amount_cents, paid_at)
      VALUES (v_order_id, v_method, 'acceptee', v_total_cents, v_date + interval '2 minutes');

      INSERT INTO invoices (order_id, number, total_cents, issued_at)
      VALUES (v_order_id,
              'FAC-' || to_char(v_date, 'YYYY') || '-' || lpad(v_order_id::text, 6, '0'),
              v_total_cents,
              v_date + interval '1 hour');
    END IF;
  END LOOP;
END $$;
