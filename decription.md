🇲🇦 Plan Fonctionnel de l'Application CRM (Version MERN + Vite)

**Stack** : MongoDB · Express.js · React (Vite) · Node.js · Tailwind CSS  
**Template** : [TailAdmin Free React Tailwind Admin Dashboard](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)  
**Langue principale** : 🇲🇦 Français uniquement (pas de switch de langue)  
**Accès** : Basé sur le rôle (Admin et Agent)  
**Auth** : Login uniquement (email + mot de passe) — pas de confirmation  

---

## Étapes de Développement

1. **Cloner le Template** : Utilisation du template TailAdmin pour accélérer le développement.  
2. **Configurer le Projet** : Installer les dépendances et configurer l'environnement.  
3. **Personnaliser le Template** : Adapter les composants et pages pour répondre aux besoins CRM.  
4. **Implémenter les Fonctionnalités** : Ajouter les modules décrits ci-dessous.  
5. **Tester et Déployer** : Vérifier les fonctionnalités et déployer l'application.  

---

## 🔐 Authentification & Gestion des Rôles

- 🔐 Login sécurisé via email et mot de passe  
- 🚫 Pas de création de compte depuis l'UI (les utilisateurs sont insérés manuellement en base)  
- ✅ Gestion des rôles : `admin`, `agent` (dans la collection `users`)  
- 👤 Les agents ne peuvent voir que leurs propres données  

---

## 📊 Tableau de Bord

- Vue dynamique selon le rôle  
- Affiche les onglets : Clients, Appels, Calendrier, Notifications, Documents, Historique, **Statistiques**  
- Mode sombre activable  

**Accès** :  
- **Admin** : Accès global  
- **Agent** : Accès personnel  

---

## 👥 Gestion des Clients

**Champs** :  
- Nom société  
- Nom contact  
- Email  
- Téléphone  
- Adresse  
- Région  
- Revenu annuel  

**Fonctionnalités** :  
- Tags personnalisés : ex. `"VIP"`, `"Froid"`, `"Demande info"`  
- Priorité du lead : 🔥 Chaud / 🧊 Tiède / ❄️ Froid  
- Pipeline : `Nouveau → Contacté → Intéressé → Converti`  

**Accès** :  
- ✅ Admin : peut ajouter, modifier, supprimer  
- 📥 Agent : peut ajouter un nouveau client, modifier s’il n'existe pas déjà (vérification email ou téléphone)  

- 🔍 Recherche et filtres disponibles  

---

## 📞 Suivi des Appels

**Ajout manuel des appels** :  
- Résultat : Succès / Pas de réponse / Rappel demandé  
- Prochaine action  
- Notes horodatées  

**Suivi des objectifs** :  
- Appels par jour/semaine  

**Admin peut voir** :  
- Nombre d'appels par agent  
- Taux de réussite  
- Tendance des appels  

---

## 🔔 Notifications

**Agents reçoivent** :  
- 🔔 Rappels  
- 📅 Rendez-vous  
- 📁 Nouveaux documents  
- ✅ Tâches manquées  

**Admin peut** :  
- Créer et envoyer une notification à un ou plusieurs agents  

---

## 🗓️ Calendrier & Rendez-vous

- Utilisation de `FullCalendar`  
- Création de rendez-vous : Titre, Description, Début/Fin  
- Filtres : par agent, client, date  

---

## 📁 Gestion des Documents

- Upload / consultation / téléchargement  
- Fichiers liés à un client  
- **Stockage** : local ou service tiers MongoDB  
- Métadonnées : Titre, Description, Type de fichier  

---

## 📈 Statistiques 

- Nombre total d'appels  
- Taux de réussite  
- Résultats par agent  
- Taux de rappels effectués  
- 📊 Graphiques avec `Recharts`  

---

## 🧑‍💼 Productivité Agent

**Les agents voient** :  
- Objectifs journaliers vs atteints  
- Nombre d'appels réussis  
- Résumé des résultats  
- État des suivis  

---

## 🕓 Historique

**Timeline pour chaque client** :  
- Appels  
- Notes  
- Documents  
- Rendez-vous  

➡️ Trié chronologiquement
