# Marketplace — Projet NoSQL B3 (persistance polyglotte)

Marketplace e-commerce (type Amazon / Cdiscount) servant de support à la mise en
place de **quatre bases de données**, chacune utilisée pour sa force :

| Base | Rôle | Données |
|------|------|---------|
| **PostgreSQL 17** | Transactionnel, intégrité forte | Clients, vendeurs, référentiel produits (prix officiel), stock, commandes, paiements, factures |
| **MongoDB 8** | Documents au schéma variable | Fiches produits riches (specs différentes selon la catégorie), avis clients embarqués |
| **Redis 8** | Clé-valeur en mémoire, volatile | Paniers (TTL 48 h), sessions (TTL 30 min), cache des fiches (TTL 10 min), compteurs de vues, classement des ventes (sorted set), ventes flash, file d'e-mails |
| **Neo4j 2025.06** | Graphe | Achats et navigation (Client, Produit, Catégorie) → recommandations « souvent achetés ensemble » |

📘 **Le livrable principal est le [dossier de conception](docs/dossier-conception.md)** :
modélisation par base, tableau de répartition des données, requêtes représentatives, schémas.

## Prérequis

- Docker Desktop (ou Docker Engine + plugin compose). **Rien d'autre** : ni Node, ni base locale.
- Ports libres : `3000` (API), `5432`, `27017`, `6379`, `7474`, `7687`.

## Lancement (machine vierge)

```bash
# 1. Démarrer les quatre bases + l'API (premier lancement : build + téléchargement)
docker compose up -d --build

# 2. Peupler les bases (PostgreSQL se peuple tout seul au 1er démarrage ;
#    ce script vérifie SQL puis peuple MongoDB, Redis et Neo4j)
docker compose run --rm seed

# 3. Vérifier que l'application est connectée aux QUATRE bases
curl http://localhost:3000/health
```

Réponse attendue : `{"ok":true,"bases":{"postgres":"ok","mongodb":"ok","redis":"ok","neo4j":"ok"}}`

**Interface web : http://localhost:3000** — le site « Panopli » (catalogue, fiches produits,
panier, commandes, ventes flash, recommandations) manipule les quatre bases en direct :
catalogue et avis depuis MongoDB, panier/compte à rebours/classement depuis Redis,
commande transactionnelle et historique depuis PostgreSQL, recommandations depuis Neo4j.
Le menu « Bonjour, … » permet de changer de client de démonstration.

Pour repartir de zéro : `docker compose down -v` puis rejouer les étapes ci-dessus.

## Tester les routes (chaque route illustre une base)

```bash
# MongoDB — catalogue, recherche plein texte, fiche riche
curl "http://localhost:3000/api/products?category=informatique"
curl "http://localhost:3000/api/products?q=café"
curl http://localhost:3000/api/products/ELEC-0001         # 1er appel : mongodb
curl http://localhost:3000/api/products/ELEC-0001         # 2e appel : redis (cache)
curl http://localhost:3000/api/products/JEUX-0001/avis

# Redis — panier avec TTL, classement temps réel, ventes flash
curl http://localhost:3000/api/cart/7
curl -X POST http://localhost:3000/api/cart/7/items -H "Content-Type: application/json" -d "{\"sku\":\"JEUX-0003\"}"
curl http://localhost:3000/api/stats/bestsellers
curl http://localhost:3000/api/flash-sales

# PostgreSQL — transaction de commande (panier → commande + stock + paiement)
curl -X POST http://localhost:3000/api/orders/7
curl http://localhost:3000/api/customers/7/orders
curl http://localhost:3000/api/stats/revenue

# Neo4j — recommandations par parcours de graphe
curl http://localhost:3000/api/products/JEUX-0001/reco
curl http://localhost:3000/api/customers/3/recommendations

# MongoDB — agrégation (note moyenne par catégorie)
curl http://localhost:3000/api/stats/ratings
```

## Explorer chaque base à la main

```bash
# PostgreSQL
docker exec -it mk_postgres psql -U marketplace -d marketplace
#   \dt   puis par ex. : SELECT * FROM orders LIMIT 5;

# MongoDB
docker exec -it mk_mongo mongosh -u root -p rootpass123
#   use marketplace   puis : db.products.findOne({sku: "INFO-0002"})

# Redis
docker exec -it mk_redis redis-cli -a redispass123
#   KEYS *   puis par ex. : HGETALL cart:7   /   TTL cart:7   /   ZREVRANGE ranking:bestsellers 0 9 WITHSCORES

# Neo4j — interface graphique : http://localhost:7474 (neo4j / neo4jpass123)
#   MATCH (c:Client)-[a:A_ACHETE]->(p:Produit) RETURN c, a, p LIMIT 50
```

## Vérifier la persistance

Les quatre bases écrivent dans des volumes Docker nommés (Redis a l'AOF activé) :

```bash
docker compose restart   # ou down (SANS -v) puis up -d
curl http://localhost:3000/api/stats/bestsellers   # les données sont toujours là
```

## Structure du dépôt

```
├── docker-compose.yml        # les 4 bases + API + service de seed
├── seed/sql/                 # schéma + jeu de données PostgreSQL (auto-exécutés au 1er boot)
├── app/
│   ├── Dockerfile
│   ├── public/               # interface web « Panopli » (front statique, non noté)
│   └── src/
│       ├── db/               # connexions aux 4 bases (pg, mongodb, redis, neo4j-driver)
│       ├── routes/           # API Express : chaque route exploite la bonne base
│       ├── seed/             # seed MongoDB / Redis / Neo4j (déterministe, rejouable)
│       └── server.js
└── docs/dossier-conception.md  # LIVRABLE PRINCIPAL
```

## Jeu de données

Généré de façon **déterministe** (seeds fixes côté SQL `setseed` et côté Node `mulberry32`) :
6 vendeurs, 20 clients, 40 produits (7 catégories), 150 commandes sur 6 mois avec paiements
et factures, ~200 avis clients, paniers/sessions/ventes flash en cours, graphe d'achats
et de navigation complet. Les « paniers types » (console + manette + jeu…) donnent un vrai
signal aux recommandations Neo4j et au classement Redis.
