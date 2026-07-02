-- ====================================================================
--  Marketplace — schéma PostgreSQL
--  Rôle : données transactionnelles à intégrité forte.
--  Clients, vendeurs, référentiel produits (prix officiel), stock,
--  commandes, paiements, factures.
--  Exécuté automatiquement au premier démarrage du conteneur postgres.
-- ====================================================================

CREATE TYPE order_status   AS ENUM ('en_attente', 'payee', 'expediee', 'livree', 'annulee');
CREATE TYPE payment_method AS ENUM ('carte', 'paypal', 'virement');
CREATE TYPE payment_status AS ENUM ('en_attente', 'acceptee', 'refusee');
CREATE TYPE address_type   AS ENUM ('livraison', 'facturation');

-- Vendeurs tiers de la marketplace (commission prélevée sur chaque vente).
CREATE TABLE sellers (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    commission_rate NUMERIC(4, 3) NOT NULL DEFAULT 0.100
                    CHECK (commission_rate BETWEEN 0 AND 1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id         SERIAL PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    phone      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
    id          SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type        address_type NOT NULL DEFAULT 'livraison',
    line1       TEXT NOT NULL,
    zip_code    TEXT NOT NULL,
    city        TEXT NOT NULL,
    country     TEXT NOT NULL DEFAULT 'France'
);

-- Référentiel produit MINIMAL : identité, prix officiel, TVA.
-- La fiche riche (description, specs, avis, images) vit dans MongoDB,
-- reliée par le même SKU. Le prix stocké ici fait foi lors du paiement.
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    sku         TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    seller_id   INT NOT NULL REFERENCES sellers(id),
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    vat_rate    NUMERIC(4, 3) NOT NULL DEFAULT 0.200,
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- Stock séparé des produits : la ligne est verrouillée (SELECT ... FOR UPDATE)
-- au passage de commande pour interdire la survente.
CREATE TABLE stock (
    product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    customer_id         INT NOT NULL REFERENCES customers(id),
    shipping_address_id INT NOT NULL REFERENCES addresses(id),
    status              order_status NOT NULL DEFAULT 'en_attente',
    ordered_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    order_id         INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id       INT NOT NULL REFERENCES products(id),
    quantity         INT NOT NULL CHECK (quantity > 0),
    -- prix figé au moment de l'achat : l'historique reste juste
    -- même si le prix catalogue change ensuite
    unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE payments (
    id           SERIAL PRIMARY KEY,
    order_id     INT NOT NULL REFERENCES orders(id),
    method       payment_method NOT NULL,
    status       payment_status NOT NULL DEFAULT 'en_attente',
    amount_cents INT NOT NULL CHECK (amount_cents >= 0),
    paid_at      TIMESTAMPTZ
);

CREATE TABLE invoices (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL UNIQUE REFERENCES orders(id),
    number      TEXT NOT NULL UNIQUE,
    total_cents INT NOT NULL CHECK (total_cents >= 0),
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index sur les chemins d'accès fréquents.
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_date       ON orders(ordered_at);
CREATE INDEX idx_order_items_prod  ON order_items(product_id);
CREATE INDEX idx_payments_order    ON payments(order_id);
CREATE INDEX idx_products_category ON products(category);
