class BackupService {
  constructor(noteStore, boardStore, settingsStore, appVersion) {
    this.noteStore = noteStore
    this.boardStore = boardStore
    this.settingsStore = settingsStore
    this.appVersion = appVersion
  }

  async createBackupData() {
    const [notes, boards, settings] = await Promise.all([
      this.noteStore.getAllNotes({
        includeDeleted: true
      }),

      this.boardStore.getAllBoards(),

      this.settingsStore.getAll()
    ])

    return {
      backupVersion: 1,
      application: 'Postiva',
      applicationVersion: this.appVersion ?? '1.0.0',
      createdAt: new Date().toISOString(),

      data: {
        notes,
        boards,
        settings
      }
    }
  }
}

export default BackupService
