-- =========================================================
-- NUTRICI - SCRIPT DE CREATION DE LA BASE DE DONNEES
-- =========================================================

DROP DATABASE IF EXISTS nutrici;
CREATE DATABASE nutrici CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutrici;

-- =========================================================
-- TABLE CATEGORIE
-- =========================================================
CREATE TABLE Categorie (
    code    VARCHAR(20)  NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description VARCHAR(500) NULL,
    image   VARCHAR(255) NULL,
    dateCreation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (code)
) ENGINE=InnoDB;

-- =========================================================
-- TABLE PRODUIT
-- (Appartenir : Categorie 1,n -- Produit 1,1)
-- Un produit appartient obligatoirement a une seule categorie
-- => FK categorieCode NOT NULL
-- =========================================================
CREATE TABLE Produit (
    ref            VARCHAR(30) NOT NULL,
    nomP           VARCHAR(200) NOT NULL,
    description    TEXT NULL,
    prixUnitaire   DECIMAL(10,2) NOT NULL,
    qteStock       INT NOT NULL DEFAULT 0,
    image          VARCHAR(255) NULL,
    categorieCode  VARCHAR(20) NOT NULL,
    dateCreation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif          TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (ref),
    CONSTRAINT fk_produit_categorie
        FOREIGN KEY (categorieCode) REFERENCES Categorie(code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_prix_positif CHECK (prixUnitaire >= 0),
    CONSTRAINT chk_stock_positif CHECK (qteStock >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- TABLE FOURNISSEUR
-- =========================================================
CREATE TABLE Fournisseur (
    codeFournisseur VARCHAR(20) NOT NULL,
    raisonSocial    VARCHAR(200) NOT NULL,
    pays            VARCHAR(100) NOT NULL,
    emailFournisseur VARCHAR(150) NOT NULL,
    telephone       VARCHAR(30) NULL,
    dateCreation    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (codeFournisseur),
    CONSTRAINT uq_email_fournisseur UNIQUE (emailFournisseur)
) ENGINE=InnoDB;

-- =========================================================
-- ASSOCIATION APPROVISIONNER (Produit N,N Fournisseur)
-- =========================================================
CREATE TABLE Approvisionner (
    produitRef      VARCHAR(30) NOT NULL,
    codeFournisseur VARCHAR(20) NOT NULL,
    dateApprovisionnement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantiteApprovisionnee INT NOT NULL DEFAULT 0,
    PRIMARY KEY (produitRef, codeFournisseur),
    CONSTRAINT fk_approv_produit
        FOREIGN KEY (produitRef) REFERENCES Produit(ref)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_approv_fournisseur
        FOREIGN KEY (codeFournisseur) REFERENCES Fournisseur(codeFournisseur)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE CLIENT
-- Contient aussi les infos d'authentification (role, motDePasse)
-- =========================================================
CREATE TABLE Client (
    email       VARCHAR(100) NOT NULL,
    nomC        VARCHAR(150) NOT NULL,
    telephone   VARCHAR(30) NOT NULL,
    adresse     VARCHAR(255) NULL,
    motDePasse  VARCHAR(255) NOT NULL,
    role        ENUM('CLIENT','ADMINISTRATEUR') NOT NULL DEFAULT 'CLIENT',
    dateInscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email)
) ENGINE=InnoDB;

-- =========================================================
-- TABLE COMMANDE
-- (Passer : Client 1,n -- Commande 0,1)
-- Une commande appartient a un client => FK clientEmail
-- Cote client 0,1 signifie que la commande a un seul client (obligatoire cote commande)
-- =========================================================
CREATE TABLE Commande (
    noCommande  INT NOT NULL AUTO_INCREMENT,
    date        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut      ENUM('EN_ATTENTE','PAYEE','EN_PREPARATION','EXPEDIEE','LIVREE','ANNULEE')
                NOT NULL DEFAULT 'EN_ATTENTE',
    clientEmail VARCHAR(100) NOT NULL,
    montantTotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    adresseLivraison VARCHAR(255) NOT NULL,
    telephoneLivraison VARCHAR(30) NOT NULL,
    modePaiement VARCHAR(50) NOT NULL DEFAULT 'MOBILE_MONEY',
    referenceTransaction VARCHAR(100) NULL,
    nomCoursier VARCHAR(150) NULL,
    PRIMARY KEY (noCommande),
    CONSTRAINT fk_commande_client
        FOREIGN KEY (clientEmail) REFERENCES Client(email)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- ASSOCIATION CONTENIR -> LigneCommande
-- (Produit 1,n -- Commande 1,n) avec attributs qteCommande, prixFacture
-- =========================================================
CREATE TABLE LigneCommande (
    id           INT NOT NULL AUTO_INCREMENT,
    noCommande   INT NOT NULL,
    produitRef   VARCHAR(30) NOT NULL,
    qteCommande  INT NOT NULL,
    prixFacture  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_commande_produit UNIQUE (noCommande, produitRef),
    CONSTRAINT fk_ligne_commande
        FOREIGN KEY (noCommande) REFERENCES Commande(noCommande)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ligne_produit
        FOREIGN KEY (produitRef) REFERENCES Produit(ref)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_qte_commande_positive CHECK (qteCommande > 0),
    CONSTRAINT chk_prix_facture_positif CHECK (prixFacture >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- INDEX SUPPLEMENTAIRES (performance)
-- =========================================================
CREATE INDEX idx_produit_categorie ON Produit(categorieCode);
CREATE INDEX idx_commande_client ON Commande(clientEmail);
CREATE INDEX idx_commande_statut ON Commande(statut);
CREATE INDEX idx_ligne_commande ON LigneCommande(noCommande);

-- =========================================================
-- DONNEES DE DEMARRAGE : CATEGORIES
-- =========================================================
INSERT INTO Categorie (code, libelle, description) VALUES
('CAT-PROT', 'Proteines', 'Whey, caseine, proteines vegetales pour la prise de masse musculaire'),
('CAT-VITA', 'Vitamines & Mineraux', 'Complements pour renforcer le systeme immunitaire'),
('CAT-MINC', 'Minceur', 'Produits pour la gestion du poids et la combustion des graisses'),
('CAT-ENER', 'Energie & Performance', 'Boosters d energie et complements pre-entrainement'),
('CAT-BIEN', 'Bien-etre', 'Sommeil, stress, digestion et sante generale');

-- =========================================================
-- DONNEES DE DEMARRAGE : FOURNISSEURS
-- =========================================================
INSERT INTO Fournisseur (codeFournisseur, raisonSocial, pays, emailFournisseur, telephone) VALUES
('FRS-001', 'NutriSupply SARL', 'Cote d Ivoire', 'contact@nutrisupply.ci', '+225 07 00 00 01'),
('FRS-002', 'BioNat Distribution', 'France', 'contact@bionat.fr', '+33 1 23 45 67 89'),
('FRS-003', 'GlobalHealth Trading', 'Etats-Unis', 'sales@globalhealth.com', '+1 202 555 0100');

-- =========================================================
-- DONNEES DE DEMARRAGE : PRODUITS
-- =========================================================
INSERT INTO Produit (ref, nomP, description, prixUnitaire, qteStock, categorieCode) VALUES
('PRD-0001', 'Whey Protein Gold 2kg', 'Proteine de lactoserum isolat, 24g de proteines par dose, gout chocolat', 35000, 40, 'CAT-PROT'),
('PRD-0002', 'Proteine Vegetale Bio 1kg', 'Melange pois-riz, sans lactose, ideal apres l entrainement', 28000, 25, 'CAT-PROT'),
('PRD-0003', 'Multivitamines Complet', 'Formule complete 12 vitamines et 8 mineraux, cure 3 mois', 12000, 60, 'CAT-VITA'),
('PRD-0004', 'Vitamine D3 + K2', 'Renforce les os et le systeme immunitaire, flacon 90 gelules', 9500, 50, 'CAT-VITA'),
('PRD-0005', 'Bruleur de Graisse Thermo', 'Formule thermogenique a base de the vert et cafeine', 18000, 30, 'CAT-MINC'),
('PRD-0006', 'Coupe-Faim Naturel', 'A base de konjac et glucomannane, aide au controle de l appetit', 15000, 20, 'CAT-MINC'),
('PRD-0007', 'Pre-Workout Extreme', 'Booster de performance avec beta-alanine et cafeine', 22000, 35, 'CAT-ENER'),
('PRD-0008', 'BCAA Recovery', 'Acides amines ramifies pour la recuperation musculaire', 19500, 45, 'CAT-ENER'),
('PRD-0009', 'Melatonine Sommeil', 'Aide a l endormissement naturel, sans accoutumance', 8500, 55, 'CAT-BIEN'),
('PRD-0010', 'Probiotiques Digestion', 'Flore intestinale equilibree, 10 milliards de ferments', 14000, 40, 'CAT-BIEN');

-- =========================================================
-- DONNEES DE DEMARRAGE : APPROVISIONNEMENTS
-- =========================================================
INSERT INTO Approvisionner (produitRef, codeFournisseur, quantiteApprovisionnee) VALUES
('PRD-0001', 'FRS-001', 40),
('PRD-0001', 'FRS-003', 20),
('PRD-0002', 'FRS-002', 25),
('PRD-0003', 'FRS-001', 60),
('PRD-0004', 'FRS-002', 50),
('PRD-0005', 'FRS-003', 30),
('PRD-0006', 'FRS-001', 20),
('PRD-0007', 'FRS-003', 35),
('PRD-0008', 'FRS-002', 45),
('PRD-0009', 'FRS-001', 55),
('PRD-0010', 'FRS-002', 40);

-- =========================================================
-- COMPTE ADMINISTRATEUR PAR DEFAUT
-- Mot de passe en clair : Admin@2026 (sera remplace par un hash bcrypt reel)
-- Le hash ci-dessous correspond a bcrypt("Admin@2026", 10)
-- =========================================================
INSERT INTO Client (email, nomC, telephone, adresse, motDePasse, role) VALUES
('admin@nutrici.ci', 'Administrateur NutriCI', '+225 07 00 00 00', 'Abidjan, Cocody', '$2b$10$YQKz3E4h3z8V9r1U9L8bZuG9wq0aF3E7dQ0i1kM1G8sVn7oXn2bWK', 'ADMINISTRATEUR');