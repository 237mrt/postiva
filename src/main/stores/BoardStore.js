import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

class BoardStore {
  constructor(userDataPath) {
    this.dataDirectory = path.join(userDataPath, 'data')
    this.filePath = path.join(this.dataDirectory, 'boards.json')

    this.defaultBoards = [
      {
        id: 'default-lessons',
        name: 'Dersler',
        icon: '📘',
        color: 'blue',
        sortOrder: 0
      },
      {
        id: 'default-work',
        name: 'İş',
        icon: '💼',
        color: 'orange',
        sortOrder: 1
      },
      {
        id: 'default-projects',
        name: 'Projeler',
        icon: '🚀',
        color: 'green',
        sortOrder: 2
      },
      {
        id: 'default-personal',
        name: 'Kişisel',
        icon: '💗',
        color: 'pink',
        sortOrder: 3
      }
    ]

    this.defaultData = {
      version: 1,
      boards: this.defaultBoards
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

    console.log(`[Postiva] Pano dosyası hazır: ${this.filePath}`)

    return data
  }

  async readData() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8')

      const parsedData = JSON.parse(fileContent)

      if (!Array.isArray(parsedData.boards)) {
        throw new Error('boards alanı geçerli bir dizi değil.')
      }

      return {
        version: parsedData.version ?? 1,
        boards: parsedData.boards
          .filter(Boolean)
          .map((board, index) => this.normalizeStoredBoard(board, index))
      }
    } catch (error) {
      console.error('[Postiva] Pano dosyası okunamadı:', error)

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
       * Önce pano verilerini geçici dosyaya yazıyoruz.
       */
      await fs.writeFile(temporaryFilePath, jsonContent, 'utf8')

      /*
       * Yazma tamamlandıktan sonra geçici dosyayı
       * gerçek boards.json dosyasının yerine geçiriyoruz.
       */
      await fs.rename(temporaryFilePath, this.filePath)
    } catch (error) {
      /*
       * Hata oluşursa yarım kalan geçici dosyayı temizliyoruz.
       */
      try {
        await fs.rm(temporaryFilePath, {
          force: true
        })
      } catch {
        // Geçici dosya yoksa temizleme gerekmez.
      }

      throw error
    }
  }

  async getAllBoards() {
    const data = await this.readData()

    return [...data.boards].sort(
      (firstBoard, secondBoard) => firstBoard.sortOrder - secondBoard.sortOrder
    )
  }

  async getBoardById(boardId) {
    const data = await this.readData()

    return data.boards.find((board) => board.id === boardId) ?? null
  }

  async createBoard(boardData) {
    const name = String(boardData.name ?? '').trim()

    if (!name) {
      throw new Error('Pano adı zorunludur.')
    }

    const data = await this.readData()
    const now = new Date().toISOString()

    const newBoard = {
      id: randomUUID(),
      name,
      icon: boardData.icon ?? '📌',
      color: boardData.color ?? 'purple',
      sortOrder: data.boards.length,
      createdAt: now,
      updatedAt: now
    }

    data.boards.push(newBoard)

    await this.writeData(data)

    return newBoard
  }

  async updateBoard(boardId, boardData) {
    const data = await this.readData()

    const boardIndex = data.boards.findIndex((board) => board.id === boardId)

    if (boardIndex === -1) {
      throw new Error('Pano bulunamadı.')
    }

    const currentBoard = data.boards[boardIndex]

    const name = boardData.name !== undefined ? String(boardData.name).trim() : currentBoard.name

    if (!name) {
      throw new Error('Pano adı zorunludur.')
    }

    const updatedBoard = {
      ...currentBoard,
      name,
      icon: boardData.icon ?? currentBoard.icon,
      color: boardData.color ?? currentBoard.color,
      sortOrder: boardData.sortOrder ?? currentBoard.sortOrder,
      updatedAt: new Date().toISOString()
    }

    data.boards[boardIndex] = updatedBoard

    await this.writeData(data)

    return updatedBoard
  }

  async deleteBoard(boardId) {
    const data = await this.readData()

    const boardExists = data.boards.some((board) => board.id === boardId)

    if (!boardExists) {
      throw new Error('Pano bulunamadı.')
    }

    data.boards = data.boards.filter((board) => board.id !== boardId)

    data.boards = data.boards.map((board, index) => ({
      ...board,
      sortOrder: index
    }))

    await this.writeData(data)

    return true
  }

  normalizeStoredBoard(board, index) {
    return {
      ...board,
      id: String(board.id),
      name: String(board.name ?? 'Başlıksız Pano'),
      icon: board.icon ?? '📌',
      color: board.color ?? 'purple',
      sortOrder: Number.isInteger(board.sortOrder) ? board.sortOrder : index,
      createdAt: board.createdAt ?? new Date().toISOString(),
      updatedAt: board.updatedAt ?? new Date().toISOString()
    }
  }

  async replaceAllBoards(boards) {
    if (!Array.isArray(boards)) {
      throw new Error('Geri yüklenecek panolar geçerli bir dizi değil.')
    }

    const normalizedBoards = boards.map((board, index) => {
      if (!board || typeof board !== 'object' || Array.isArray(board)) {
        throw new Error('Yedek dosyasında geçersiz bir pano kaydı bulundu.')
      }

      const boardId = String(board.id ?? '').trim()

      if (!boardId) {
        throw new Error('Yedek dosyasındaki bir panonun kimliği bulunmuyor.')
      }

      return this.normalizeStoredBoard(
        {
          ...board,
          id: boardId
        },
        index
      )
    })

    const boardIds = new Set()

    for (const board of normalizedBoards) {
      if (boardIds.has(board.id)) {
        throw new Error(`Yedek dosyasında tekrarlanan pano kimliği bulundu: ${board.id}`)
      }

      boardIds.add(board.id)
    }

    const restoredBoards = normalizedBoards.map((board, index) => ({
      ...board,
      sortOrder: index
    }))

    const restoredData = {
      version: 1,
      boards: restoredBoards
    }

    await this.writeData(restoredData)

    console.log(`[Postiva] ${restoredBoards.length} pano geri yükleme için kaydedildi.`)

    return restoredBoards
  }

  async backupCorruptedFile() {
    try {
      await fs.access(this.filePath)

      const backupPath = path.join(this.dataDirectory, `boards-corrupted-${Date.now()}.json`)

      await fs.copyFile(this.filePath, backupPath)

      console.warn(`[Postiva] Bozuk pano dosyası yedeklendi: ${backupPath}`)
    } catch {
      // Dosya mevcut değilse yedekleme gerekmez.
    }
  }
}

export default BoardStore
