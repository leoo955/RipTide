# Spécifications Fonctionnelles et Techniques — RipTide

## 1. Objectif du projet
RipTide est une application desktop open source, légère, sécurisée et sans télémétrie, conçue pour extraire, télécharger et multiplexer des flux vidéo/audio distants directement sur le poste de travail de l'utilisateur.

## 2. Périmètre fonctionnel (MVP — v1.0)
* **Validation & Analyse d'URL :**
  * Validation syntaxique et détection de protocoles pris en charge (`http://`, `https://`).
  * Extraction asynchrone des métadonnées distantes sans blocage du thread UI.
* **Inspection du Média :**
  * Titre complet, durée (secondes/formaté), miniature (*thumbnail*), et auteur/chaîne.
  * Liste normalisée des résolutions vidéo disponibles (1080p, 720p, 480p, 360p) avec conteneurs associés (`mp4`, `webm`).
  * Option d'extraction audio seule (`mp3`, `m4a`, `opus`).
* **Moteur de Téléchargement :**
  * Streaming asynchrone par blocs (*chunks*) avec bufferisation mémoire maîtrisée.
  * Emission d'événements de télémétrie locale en temps réel : pourcentage d'avancement, vitesse (Mo/s), octets reçus/totaux, temps restant estimé (ETA).
  * Annulation propre d'un téléchargement en cours avec libération des descripteurs de fichiers et nettoyage des fichiers temporaires.
* **Post-traitement & Assemblage :**
  * Détection automatique de la présence de l'exécutable `ffmpeg` sur le système hôte.
  * Multiplexage vidéo + audio via copie de flux sans ré-encodage (`-c copy`) pour minimiser la charge CPU.
  * Déplacement atomique du fichier final vers le dossier de destination utilisateur (`~/Downloads` par défaut).

## 3. Matrice des codes d'erreur

| Code d'erreur | Description | Action UI préconisée |
| :--- | :--- | :--- |
| `ERR_INVALID_URL` | L'URL fournie est malformée ou non supportée. | Affichage d'une bordure rouge et message sous l'input. |
| `ERR_NETWORK_FAILURE` | Échec de connexion au serveur distant ou timeout. | Proposer une réessai automatique après 5s. |
| `ERR_MEDIA_NOT_FOUND` | La ressource est privée, supprimée ou géo-bloquée. | Alerte explicite avec détail retourné par l'extracteur. |
| `ERR_FFMPEG_MISSING` | Binaire `ffmpeg` introuvable dans le PATH système. | Bannière critique avec lien vers les guides d'installation. |
| `ERR_DISK_FULL` | Espace disque insuffisant dans le répertoire cible. | Interruption immédiate et alerte système. |
| `ERR_MUX_FAILED` | Échec lors du multiplexage via le sous-processus `ffmpeg`. | Conservation des logs stderr pour débogage. |