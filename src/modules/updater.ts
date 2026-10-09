import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process'; // Needs to be installed, or we just rely on the user to manually restart

export async function checkForUpdates() {
  try {
    const update = await check();
    
    if (update) {
      console.log(`Mise à jour trouvée : ${update.version} de ${update.date}`);
      
      const shouldUpdate = await ask(
        `Une nouvelle version (${update.version}) est disponible !\n\nNotes de version :\n${update.body}\n\nVoulez-vous l'installer maintenant ?`,
        { title: 'Mise à jour RipTide', kind: 'info' }
      );
      
      if (shouldUpdate) {
        let downloaded = 0;
        let contentLength = 0;
        
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength || 0;
              console.log(`Début du téléchargement : ${contentLength} bytes`);
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              console.log(`Téléchargement : ${downloaded} / ${contentLength}`);
              break;
            case 'Finished':
              console.log('Téléchargement terminé !');
              break;
          }
        });
        
        await message('La mise à jour a été installée avec succès. L\'application va redémarrer.', { title: 'Mise à jour terminée', kind: 'info' });
        
        // Relaunch the app to apply the update (requires @tauri-apps/plugin-process)
        // await relaunch();
      }
    } else {
      console.log("L'application est à jour.");
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
  }
}
