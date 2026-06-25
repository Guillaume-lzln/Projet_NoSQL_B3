# Marketplace — Projet NoSQL B3

Petit marketplace e-commerce servant de support à la mise en place de **quatre bases de données**.

## L'application (support, non noté)

Un site de vente en ligne : on parcourt un catalogue de produits, on les ajoute à un panier, on passe commande et on voit des recommandations. 

## Répartition des bases

| Base | Rôle dans le projet | Données stockées |
|------|--------------------|------------------|
| **SQL** (PostgreSQL) | Transactionnel, intégrité forte | Comptes clients, commandes, lignes de commande, factures, paiements, stock |
| **MongoDB** | Documents au schéma variable | Fiches produits hétérogènes (attributs différents selon la catégorie : taille/pointure pour un vêtement, RAM/CPU pour un PC…) |
| **Redis** | Volatile / temps réel | Paniers (avec TTL), cache du catalogue, compteurs de vues produits, classement des meilleures ventes (sorted set), flash-sales |
| **Neo4j** | Graphe de relations | Recommandations « souvent achetés ensemble », graphe produits ↔ catégories, parcours de navigation |

## À faire

1. **Infrastructure** : un seul `docker-compose` démarrant les quatre bases (`postgres`, `mongo`, `redis`, `neo4j`), avec ports, volumes et variables configurés.
2. **Connexion réelle** : l'application se connecte aux quatre bases et y lit/écrit réellement.
3. **Seed** : des scripts d'initialisation peuplent chaque base avec un jeu de données réaliste (catalogue, clients, commandes, relations d'achat).
4. **Exploitation** : quelques requêtes représentatives par base : CRUD + jointures SQL, agrégation MongoDB, structures + TTL Redis, Cypher de recommandation Neo4j.
