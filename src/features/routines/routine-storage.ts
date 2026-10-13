import { createLocalImageStorage, isLocalImage } from '../communication/custom-cards/local-image-storage';
import { normalizedRoutine, type Routine, type RoutineDraft } from './routine-model';
import type { RoutineDatabase } from './routine-database';

export const routineImages = createLocalImageStorage('routine-images');
export function createRoutineStorage(db: RoutineDatabase, images = routineImages) {
  return {
    list: db.list,
    progress: db.progress,
    async save(input: RoutineDraft, previous?: Routine): Promise<Routine[]> {
      const draft = normalizedRoutine(input);
      const copied: string[] = [];
      try {
        const steps = [];
        for (const step of draft.steps) {
          let imageUri = step.imageUri;
          if (imageUri && !isLocalImage(imageUri)) throw new Error('Local image required.');
          if (imageUri && imageUri !== previous?.steps.find((saved) => saved.id === step.id)?.imageUri) {
            imageUri = await images.copy(imageUri); copied.push(imageUri);
          }
          steps.push({ ...step, imageUri });
        }
        return await db.save({ ...draft, steps }, previous?.id);
      } catch {
        await Promise.all(copied.map((uri) => images.remove(uri).catch(() => undefined)));
        throw new Error('Could not save routine.');
      }
    },
    async prune() {
      const routines = await db.list();
      await images.prune(routines.flatMap((routine) => routine.steps.flatMap((step) => step.imageUri ? [step.imageUri] : [])));
    },
  };
}
