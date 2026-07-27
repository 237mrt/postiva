import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

class NoteStore {
  constructor(userDataPath) {
    this.dataDirectory = path.join(userDataPath, 'data')
    this.filePath = path.join(this.dataDirectory, 'notes.json')

    this.defaultData = {
      version: 1,
      notes: []
    }
  }

  async initialize() {
    await fs.mkdir(this.dataDirectory, {
      recursive: true
    })

    try {
      await fs.access(this.filePath)
    } catch {
      await this.writeData(this.defaultData)
    }

    const data = await this.readData()

    console.log(`[Postiva] Not dosyası hazır: ${this.filePath}`)

    return data
  }

  async readData() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8')

      const parsedData = JSON.parse(fileContent)

      if (!Array.isArray(parsedData.notes)) {
        throw new Error('notes alanı geçerli bir dizi değil.')
      }

      return {
        version: parsedData.version ?? 1,
        notes: parsedData.notes.filter(Boolean).map((note) => this.normalizeStoredNote(note))
      }
    } catch (error) {
      console.error('[Postiva] Not dosyası okunamadı:', error)

      await this.backupCorruptedFile()
      await this.writeData(this.defaultData)

      return structuredClone(this.defaultData)
    }
  }

  async writeData(data) {
    const jsonContent = JSON.stringify(data, null, 2)

    const temporaryFilePath = `${this.filePath}.tmp`

    try {
      /*
       * Önce veriyi geçici dosyaya yazıyoruz.
       * Böylece notes.json yazma sırasında yarım kalmıyor.
       */
      await fs.writeFile(temporaryFilePath, jsonContent, 'utf8')

      /*
       * Geçici dosya başarıyla oluşturulduktan sonra
       * gerçek not dosyasının yerine geçiriyoruz.
       */
      await fs.rename(temporaryFilePath, this.filePath)
    } catch (error) {
      /*
       * İşlem başarısız olursa geçici dosyanın
       * projede kalmasını engelliyoruz.
       */
      try {
        await fs.rm(temporaryFilePath, {
          force: true
        })
      } catch {
        // Geçici dosya zaten yoksa işlem gerekmez.
      }

      throw error
    }
  }

  async getAllNotes({ includeDeleted = false } = {}) {
    const data = await this.readData()

    if (includeDeleted) {
      return data.notes
    }

    return data.notes.filter((note) => note.deletedAt === null)
  }

  async getDeletedNotes() {
    const data = await this.readData()

    return data.notes.filter((note) => note.deletedAt !== null)
  }

  async getNoteById(noteId) {
    const data = await this.readData()

    return data.notes.find((note) => note.id === noteId) ?? null
  }

  async createNote(noteData) {
    const title = String(noteData.title ?? '').trim()

    if (!title) {
      throw new Error('Not başlığı zorunludur.')
    }

    const now = new Date().toISOString()

    const newNote = {
      id: randomUUID(),
      title,

      content: this.normalizeContent(noteData.content),

      boardId:
        typeof noteData.boardId === 'string' && noteData.boardId.trim() ? noteData.boardId : null,

      color: noteData.color ?? 'yellow',
      decoration: noteData.decoration ?? '✦',

      priority: noteData.priority ?? 'normal',
      dueDate: noteData.dueDate ?? null,

      isCompleted: Boolean(noteData.isCompleted),

      isPinned: Boolean(noteData.isPinned),

      createdAt: now,
      updatedAt: now,
      deletedAt: null
    }

    const data = await this.readData()

    data.notes.push(newNote)

    await this.writeData(data)

    return newNote
  }

  async clearBoardFromNotes(boardId) {
    const data = await this.readData()
    const now = new Date().toISOString()

    let changedNoteCount = 0

    data.notes = data.notes.map((note) => {
      if (note.boardId !== boardId) {
        return note
      }

      changedNoteCount += 1

      return {
        ...note,
        boardId: null,
        updatedAt: now
      }
    })

    if (changedNoteCount > 0) {
      await this.writeData(data)
    }

    return changedNoteCount
  }

  async updateNote(noteId, noteData) {
    const data = await this.readData()

    const noteIndex = data.notes.findIndex((note) => note.id === noteId)

    if (noteIndex === -1) {
      throw new Error('Not bulunamadı.')
    }

    const currentNote = data.notes[noteIndex]

    const updatedTitle =
      noteData.title !== undefined ? String(noteData.title).trim() : currentNote.title

    if (!updatedTitle) {
      throw new Error('Not başlığı zorunludur.')
    }

    const updatedNote = {
      ...currentNote,

      title: updatedTitle,

      content:
        noteData.content !== undefined
          ? this.normalizeContent(noteData.content)
          : currentNote.content,

      color: noteData.color ?? currentNote.color,
      priority: noteData.priority ?? currentNote.priority ?? 'normal',

      boardId:
        noteData.boardId !== undefined ? noteData.boardId || null : (currentNote.boardId ?? null),

      dueDate: noteData.dueDate !== undefined ? noteData.dueDate : (currentNote.dueDate ?? null),

      decoration: noteData.decoration ?? currentNote.decoration,

      isCompleted: noteData.isCompleted ?? currentNote.isCompleted,

      isPinned: noteData.isPinned ?? currentNote.isPinned,

      updatedAt: new Date().toISOString()
    }

    data.notes[noteIndex] = updatedNote

    await this.writeData(data)

    return updatedNote
  }

  async moveToTrash(noteId) {
    return this.updateDeletedAt(noteId, new Date().toISOString())
  }

  async restoreNote(noteId) {
    return this.updateDeletedAt(noteId, null)
  }

  async permanentlyDeleteNote(noteId) {
    const data = await this.readData()

    const noteExists = data.notes.some((note) => note.id === noteId)

    if (!noteExists) {
      throw new Error('Not bulunamadı.')
    }

    data.notes = data.notes.filter((note) => note.id !== noteId)

    await this.writeData(data)

    return true
  }

  async updateDeletedAt(noteId, deletedAt) {
    const data = await this.readData()

    const noteIndex = data.notes.findIndex((note) => note.id === noteId)

    if (noteIndex === -1) {
      throw new Error('Not bulunamadı.')
    }

    data.notes[noteIndex] = {
      ...data.notes[noteIndex],
      deletedAt,
      updatedAt: new Date().toISOString()
    }

    await this.writeData(data)

    return data.notes[noteIndex]
  }
  normalizeStoredNote(note) {
    return {
      ...note,

      id: String(note.id),
      title: String(note.title ?? 'Başlıksız Not'),
      content: this.normalizeContent(note.content),

      boardId: typeof note.boardId === 'string' && note.boardId.trim() ? note.boardId : null,

      color: note.color ?? 'yellow',
      decoration: note.decoration ?? '✦',

      priority: ['low', 'normal', 'high'].includes(note.priority) ? note.priority : 'normal',

      dueDate: note.dueDate ?? null,

      isCompleted: Boolean(note.isCompleted),
      isPinned: Boolean(note.isPinned),

      createdAt: note.createdAt ?? new Date().toISOString(),

      updatedAt: note.updatedAt ?? new Date().toISOString(),

      deletedAt: note.deletedAt ?? null
    }
  }

  normalizeContent(content) {
    if (Array.isArray(content)) {
      return content.map((item) => String(item).trim()).filter(Boolean)
    }

    return String(content ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  async replaceAllNotes(notes) {
    if (!Array.isArray(notes)) {
      throw new Error('Geri yüklenecek notlar geçerli bir dizi değil.')
    }

    const normalizedNotes = notes.map((note) => {
      if (!note || typeof note !== 'object' || Array.isArray(note)) {
        throw new Error('Yedek dosyasında geçersiz bir not kaydı bulundu.')
      }

      const noteId = String(note.id ?? '').trim()

      if (!noteId) {
        throw new Error('Yedek dosyasındaki bir notun kimliği bulunmuyor.')
      }

      return this.normalizeStoredNote({
        ...note,
        id: noteId
      })
    })

    const noteIds = new Set()

    for (const note of normalizedNotes) {
      if (noteIds.has(note.id)) {
        throw new Error(`Yedek dosyasında tekrarlanan not kimliği bulundu: ${note.id}`)
      }

      noteIds.add(note.id)
    }

    const restoredData = {
      version: 1,
      notes: normalizedNotes
    }

    await this.writeData(restoredData)

    console.log(`[Postiva] ${normalizedNotes.length} not geri yükleme için kaydedildi.`)

    return normalizedNotes
  }

  async backupCorruptedFile() {
    try {
      await fs.access(this.filePath)

      const backupName = `notes-corrupted-${Date.now()}.json`

      const backupPath = path.join(this.dataDirectory, backupName)

      await fs.copyFile(this.filePath, backupPath)

      console.warn(`[Postiva] Bozuk dosya yedeklendi: ${backupPath}`)
    } catch {
      // Dosya mevcut değilse yedekleme gerekmez.
    }
  }
}

export default NoteStore
