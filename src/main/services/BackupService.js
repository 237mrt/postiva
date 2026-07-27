class BackupService {
  constructor(noteStore, boardStore, settingsStore, appVersion) {
    this.noteStore = noteStore
    this.boardStore = boardStore
    this.settingsStore = settingsStore
    this.appVersion = appVersion
  }

  async restoreBackupData(backupData) {
    /*
     * İlk olarak yedek dosyasının genel yapısını
     * kontrol ediyoruz.
     */
    const validatedData = this.validateBackupData(backupData)

    /*
     * Herhangi bir hata yaşanırsa eski verilere
     * dönebilmek için mevcut verilerin anlık
     * yedeğini bellekte tutuyoruz.
     */
    const currentBackup = await this.createBackupData()

    /*
     * Yazma işlemine başlamadan önce pano
     * kimliklerini kontrol ediyoruz.
     */
    const boardIds = new Set()

    for (const board of validatedData.boards) {
      if (!board || typeof board !== 'object' || Array.isArray(board)) {
        throw new Error('Yedek dosyasında geçersiz bir pano bulundu.')
      }

      const boardId = String(board.id ?? '').trim()

      if (!boardId) {
        throw new Error('Yedek dosyasındaki bir panonun kimliği bulunmuyor.')
      }

      if (boardIds.has(boardId)) {
        throw new Error(`Yedek dosyasında tekrarlanan pano kimliği bulundu: ${boardId}`)
      }

      boardIds.add(boardId)
    }

    /*
     * Not kimliklerini ve notların bağlı olduğu
     * panoları kontrol ediyoruz.
     */
    const noteIds = new Set()

    for (const note of validatedData.notes) {
      if (!note || typeof note !== 'object' || Array.isArray(note)) {
        throw new Error('Yedek dosyasında geçersiz bir not bulundu.')
      }

      const noteId = String(note.id ?? '').trim()

      if (!noteId) {
        throw new Error('Yedek dosyasındaki bir notun kimliği bulunmuyor.')
      }

      if (noteIds.has(noteId)) {
        throw new Error(`Yedek dosyasında tekrarlanan not kimliği bulundu: ${noteId}`)
      }

      noteIds.add(noteId)

      const boardId =
        typeof note.boardId === 'string' && note.boardId.trim() ? note.boardId.trim() : null

      if (boardId && !boardIds.has(boardId)) {
        throw new Error(
          `"${note.title ?? 'Başlıksız Not'}" notunun bağlı olduğu pano yedekte bulunmuyor.`
        )
      }
    }

    try {
      /*
       * Önce panoları yazıyoruz çünkü notlar
       * pano kimliklerine bağlı olabilir.
       */
      const restoredBoards = await this.boardStore.replaceAllBoards(validatedData.boards)

      const restoredNotes = await this.noteStore.replaceAllNotes(validatedData.notes)

      const restoredSettings = await this.settingsStore.replaceAllSettings(validatedData.settings)

      console.log('[Postiva] Yedek başarıyla geri yüklendi.')

      return {
        notes: restoredNotes,
        boards: restoredBoards,
        settings: restoredSettings
      }
    } catch (error) {
      console.error('[Postiva] Geri yükleme başarısız oldu, eski veriler geri getiriliyor:', error)

      /*
       * İşlem yarıda kalırsa kullanıcının eski
       * verilerini tekrar kaydediyoruz.
       */
      try {
        await this.boardStore.replaceAllBoards(currentBackup.data.boards)

        await this.noteStore.replaceAllNotes(currentBackup.data.notes)

        await this.settingsStore.replaceAllSettings(currentBackup.data.settings)

        console.log('[Postiva] Eski veriler başarıyla geri getirildi.')
      } catch (rollbackError) {
        console.error('[Postiva] Eski verilere dönüş başarısız oldu:', rollbackError)

        throw new Error('Yedek geri yüklenemedi ve eski verilere dönüş sırasında hata oluştu.')
      }

      throw error
    }
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

  validateBackupData(backupData) {
    if (!backupData || typeof backupData !== 'object' || Array.isArray(backupData)) {
      throw new Error('Seçilen dosya geçerli bir yedek dosyası değil.')
    }

    if (backupData.application !== 'Postiva') {
      throw new Error('Bu dosya Postiva tarafından oluşturulmamış.')
    }

    if (backupData.backupVersion !== 1) {
      throw new Error('Bu yedek sürümü mevcut Postiva sürümüyle uyumlu değil.')
    }

    const backupContent = backupData.data

    if (!backupContent || typeof backupContent !== 'object' || Array.isArray(backupContent)) {
      throw new Error('Yedek dosyasının veri bölümü bulunamadı.')
    }

    if (!Array.isArray(backupContent.notes)) {
      throw new Error('Yedek dosyasındaki notlar geçerli değil.')
    }

    if (!Array.isArray(backupContent.boards)) {
      throw new Error('Yedek dosyasındaki panolar geçerli değil.')
    }

    if (
      !backupContent.settings ||
      typeof backupContent.settings !== 'object' ||
      Array.isArray(backupContent.settings)
    ) {
      throw new Error('Yedek dosyasındaki ayarlar geçerli değil.')
    }

    return {
      notes: backupContent.notes,
      boards: backupContent.boards,
      settings: backupContent.settings
    }
  }
}

export default BackupService
