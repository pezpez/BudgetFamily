# BudgetFamily — Application mobile de budget personnel

## Vue d'ensemble
Application mobile de gestion budgétaire personnelle/familiale.  
Simple, rapide, hors-ligne first. Données stockées localement sur l'appareil.

**Cible principale :** Android (testé sur Pixel 9)  
**Cible secondaire :** iOS (compatible via Expo, sans frais Apple Store pour le dev)

---

## Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Framework | React Native + Expo SDK 52 | Cross-platform, zero config, OTA updates |
| Langage | TypeScript strict | Sécurité typage, autocomplete |
| Navigation | Expo Router (file-based) | Intuitif, deep links natifs |
| État global | Zustand | Léger, pas de boilerplate |
| Base de données | expo-sqlite + Drizzle ORM | Local, offline, performant |
| Graphiques | Victory Native NG | Donut/pie smooth, bien maintenu |
| UI components | React Native Paper (Material 3) | Design system Android-native |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | Large bibliothèque |
| Dates | date-fns | Léger, tree-shakeable |
| Tests | Jest + React Native Testing Library | Standard Expo |

---

## Design System

### Palette de couleurs
```
Primary        #5C6BC0  (Indigo 400 — confiance, finance)
Primary dark   #3949AB
Accent         #26C6DA  (Cyan — entrées d'argent)
Danger         #EF5350  (Rouge — sorties d'argent)
Success        #66BB6A  (Vert — solde positif)
Warning        #FFA726  (Orange — alertes budget)
Background     #F8F9FE  (Gris très clair)
Surface        #FFFFFF
Text primary   #1A1C2E
Text secondary #6B7280
```

### Typographie
- Font : System default (Roboto sur Android, SF Pro sur iOS)
- Titre écran : 22sp Bold
- Section header : 16sp SemiBold
- Corps : 14sp Regular
- Montant positif : Accent #26C6DA Bold
- Montant négatif : Danger #EF5350 Bold

### Principes UX
- **3 taps max** pour saisir une dépense depuis n'importe quel écran
- FAB (bouton +) toujours visible pour ajouter une transaction
- Swipe-to-delete sur les listes
- Confirmations seulement pour les suppressions
- Pas de compte utilisateur — 100% local
- Mode sombre supporté (couleurs adaptées automatiquement via React Native Paper)

---

## Architecture des données

```
Category
  id, name, icon, color

Subcategory
  id, categoryId, name, icon

Transaction
  id, subcategoryId, amount, type (income|expense),
  date, note, isRecurring, recurringRuleId

RecurringRule
  id, subcategoryId, amount, type, frequency (daily|weekly|monthly|yearly),
  dayOfMonth, dayOfWeek, startDate, endDate?, isActive, note
```

---

## Écrans de l'application

```
(tabs)
├── / (Dashboard)          — Résumé du mois en cours
├── /transactions          — Liste toutes transactions
├── /reports               — Graphiques & statistiques
└── /settings              — Catégories, paramètres

(modals/stack)
├── /transaction/new       — Ajouter une transaction
├── /transaction/[id]      — Détail / éditer
├── /categories            — Gérer catégories & sous-catégories
├── /recurring             — Gérer les récurrences
└── /reports/detail        — Drill-down catégorie
```

---

## Fonctionnalités

### Dashboard (écran d'accueil)
- Solde du mois (entrées − sorties)
- Barre de progression budget vs dépenses
- Top 3 catégories de dépenses
- Prochaines récurrences (7 jours)
- Accès rapide : FAB pour nouvelle transaction

### Transactions
- Liste chronologique avec filtre mois
- Icône catégorie + sous-catégorie + montant coloré
- Pull-to-refresh
- Swipe gauche → supprimer
- Swipe droite → éditer
- Filtre par catégorie/type

### Saisie d'une transaction
1. Choisir : **Dépense** / **Entrée** (toggle coloré)
2. Saisir le montant (pavé numérique natif)
3. Choisir la sous-catégorie (liste avec icônes)
4. Date (par défaut aujourd'hui)
5. Note optionnelle
6. Option "Récurrente" → fréquence

### Catégories & Sous-catégories
- Catégories : nom + icône + couleur
- Sous-catégories rattachées à une catégorie
- Catégories par défaut pré-installées au premier lancement :
  - Alimentation (Courses, Restaurant, Café)
  - Transport (Carburant, Transport en commun, Taxi)
  - Logement (Loyer, Charges, Internet)
  - Loisirs (Sorties, Sport, Streaming)
  - Santé (Médecin, Pharmacie, Sport)
  - Revenus (Salaire, Freelance, Autre)

### Rapports
- Sélecteur de période : semaine / mois / trimestre / année / personnalisé
- Donut chart : répartition des dépenses par catégorie
- Barre chart : évolution mensuelle entrées vs sorties
- Tableau récapitulatif par catégorie avec drill-down

### Récurrences
- Quotidien, hebdomadaire, mensuel, annuel
- Génération automatique des transactions au démarrage de l'app
- Liste des règles actives avec prochaine occurrence
- Activation/désactivation sans suppression

---

## Plan de développement (Sprints)

### Sprint 0 — Setup ✅ TERMINÉ
- [x] Projet Expo SDK 54, TypeScript, Expo Router (tabs template)
- [x] Dépendances : Zustand, Drizzle ORM, expo-sqlite, React Native Paper, date-fns
- [x] Schema SQLite : Category, Subcategory, Transaction, RecurringRule
- [x] Migrations manuelles + seeder 6 catégories / 18 sous-catégories
- [x] Thème Material 3 avec palette design system
- [x] Structure `app/`, `db/`, `store/`, `components/`, `utils/`

### Sprint 1 — Saisie & Catégories ✅ TERMINÉ
- [x] Formulaire transaction : toggle dépense/entrée, montant, picker sous-catégorie, date, note
- [x] Écran transactions : liste mensuelle, MonthSelector, suppression par appui long
- [x] Dashboard : solde, barre progression, top 3 catégories, dernières transactions, FAB
- [x] Settings : CRUD catégories (icône + couleur) et sous-catégories via dialogs Paper
- [x] Composants : TransactionItem, MonthSelector
- [x] Stores Zustand : useTransactionStore, useCategoryStore

### Sprint 2 — Récurrences (en cours)
- [ ] Store useRecurringStore (CRUD règles)
- [ ] Écran liste règles récurrentes avec prochaine occurrence
- [ ] Formulaire nouvelle règle (sous-catégorie, montant, fréquence, date début)
- [ ] Logique génération automatique des transactions au démarrage de l'app
- [ ] Toggle actif/inactif sans suppression
- [ ] Lien depuis Settings + stack screens dans root layout

### Sprint 4 — Rapports (Jours 6-7)
- [ ] Donut chart dépenses par catégorie
- [ ] Bar chart mensuel entrées/sorties
- [ ] Sélecteur de période
- [ ] Drill-down catégorie

### Sprint 5 — Polish & Tests (Jour 8)
- [ ] Mode sombre
- [ ] Animations de transitions
- [ ] Gestion des états vides (empty states illustrés)
- [ ] Tests unitaires logique métier
- [ ] Build Android APK de test (EAS Build)

---

## Commandes utiles

```bash
# Démarrer le dev server
npx expo start

# Lancer sur Android (Pixel 9 connecté en USB)
npx expo start --android

# Build APK pour tests
eas build --platform android --profile preview

# Reset cache
npx expo start --clear

# Migrations DB
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## Notes importantes
- Pas de backend — tout est local (SQLite sur l'appareil)
- Pas de compte utilisateur requis
- Export des données prévu en Sprint 5 (CSV/JSON) — optionnel
- iOS : compatible via Expo mais non publié sur App Store (évite les $99/an Apple)
- Android : publication possible sur Google Play ($25 one-time fee) — optionnel
