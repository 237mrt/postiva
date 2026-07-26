import { ipcMain } from "electron";

function registerHandler(channel, handler) {
  ipcMain.removeHandler(channel);

  ipcMain.handle(channel, async (_event, ...argumentsList) => {
    try {
      const data = await handler(...argumentsList);

      return {
        ok: true,
        data,
      };
    } catch (error) {
      console.error(`[Postiva] ${channel} hatası:`, error);

      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Bilinmeyen bir hata oluştu.",
      };
    }
  });
}

function registerNoteHandlers(noteService) {
  registerHandler("notes:list", () => noteService.getAllNotes());

  registerHandler("notes:list-deleted", () => noteService.getDeletedNotes());

  registerHandler("notes:create", (noteData) =>
    noteService.createNote(noteData),
  );

  registerHandler("notes:update", (noteId, noteData) =>
    noteService.updateNote(noteId, noteData),
  );

  registerHandler("notes:move-to-trash", (noteId) =>
    noteService.moveToTrash(noteId),
  );

  registerHandler("notes:restore", (noteId) => noteService.restoreNote(noteId));

  registerHandler("notes:permanently-delete", (noteId) =>
    noteService.permanentlyDeleteNote(noteId),
  );
}

export default registerNoteHandlers;
