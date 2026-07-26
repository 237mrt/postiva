const allowedColors = new Set([
  "purple",
  "yellow",
  "pink",
  "blue",
  "green",
  "orange",
]);

const allowedPriorities = new Set(["low", "normal", "high"]);

class NoteService {
  constructor(noteStore) {
    this.noteStore = noteStore;
  }

  async getAllNotes() {
    return this.noteStore.getAllNotes();
  }

  async getDeletedNotes() {
    return this.noteStore.getDeletedNotes();
  }

  async createNote(noteData = {}) {
    return this.noteStore.createNote({
      ...noteData,

      color: this.normalizeColor(noteData.color),

      boardId: this.normalizeBoardId(noteData.boardId),

      priority: this.normalizePriority(noteData.priority),

      dueDate: this.normalizeDueDate(noteData.dueDate),

      decoration: noteData.decoration ?? "✦",

      isCompleted: Boolean(noteData.isCompleted),
    });
  }

  async updateNote(noteId, noteData = {}) {
    this.validateNoteId(noteId);

    const normalizedData = {
      ...noteData,
    };

    if (noteData.boardId !== undefined) {
      normalizedData.boardId = this.normalizeBoardId(noteData.boardId);
    }

    if (noteData.priority !== undefined) {
      normalizedData.priority = this.normalizePriority(noteData.priority);
    }

    if (noteData.dueDate !== undefined) {
      normalizedData.dueDate = this.normalizeDueDate(noteData.dueDate);
    }

    if (noteData.isCompleted !== undefined) {
      normalizedData.isCompleted = Boolean(noteData.isCompleted);
    }

    if (noteData.color !== undefined) {
      normalizedData.color = this.normalizeColor(noteData.color);
    }

    return this.noteStore.updateNote(noteId, normalizedData);
  }

  async moveToTrash(noteId) {
    this.validateNoteId(noteId);

    return this.noteStore.moveToTrash(noteId);
  }

  async restoreNote(noteId) {
    this.validateNoteId(noteId);

    return this.noteStore.restoreNote(noteId);
  }

  async permanentlyDeleteNote(noteId) {
    this.validateNoteId(noteId);

    return this.noteStore.permanentlyDeleteNote(noteId);
  }

  normalizePriority(priority) {
    if (allowedPriorities.has(priority)) {
      return priority;
    }

    return "normal";
  }

  normalizeDueDate(dueDate) {
    if (!dueDate) {
      return null;
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Geçerli bir son tarih girilmelidir.");
    }

    return parsedDate.toISOString();
  }

  validateNoteId(noteId) {
    if (typeof noteId !== "string" || !noteId.trim()) {
      throw new Error("Geçerli bir not kimliği gereklidir.");
    }
  }

  normalizeColor(color) {
    if (allowedColors.has(color)) {
      return color;
    }

    return "yellow";
  }

  normalizeBoardId(boardId) {
    if (boardId === null || boardId === "") {
      return null;
    }

    if (typeof boardId !== "string" || !boardId.trim()) {
      throw new Error("Geçerli bir pano seçilmelidir.");
    }

    return boardId.trim();
  }
}

export default NoteService;
