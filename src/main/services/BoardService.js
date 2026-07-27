const allowedBoardColors = new Set(['purple', 'blue', 'green', 'pink', 'orange', 'yellow'])

class BoardService {
  constructor(boardStore, noteStore) {
    this.boardStore = boardStore
    this.noteStore = noteStore
  }

  async getAllBoards() {
    return this.boardStore.getAllBoards()
  }

  async createBoard(boardData = {}) {
    return this.boardStore.createBoard({
      name: boardData.name,
      icon: this.normalizeIcon(boardData.icon),
      color: this.normalizeColor(boardData.color)
    })
  }

  async updateBoard(boardId, boardData = {}) {
    this.validateBoardId(boardId)

    const normalizedData = {
      ...boardData
    }

    if (boardData.icon !== undefined) {
      normalizedData.icon = this.normalizeIcon(boardData.icon)
    }

    if (boardData.color !== undefined) {
      normalizedData.color = this.normalizeColor(boardData.color)
    }

    return this.boardStore.updateBoard(boardId, normalizedData)
  }

  async deleteBoard(boardId) {
    this.validateBoardId(boardId)

    const board = await this.boardStore.getBoardById(boardId)

    if (!board) {
      throw new Error('Pano bulunamadı.')
    }

    const detachedNoteCount = await this.noteStore.clearBoardFromNotes(boardId)

    await this.boardStore.deleteBoard(boardId)

    return {
      deletedBoardId: boardId,
      detachedNoteCount
    }
  }

  validateBoardId(boardId) {
    if (typeof boardId !== 'string' || !boardId.trim()) {
      throw new Error('Geçerli bir pano kimliği gereklidir.')
    }
  }

  normalizeColor(color) {
    if (allowedBoardColors.has(color)) {
      return color
    }

    return 'purple'
  }

  normalizeIcon(icon) {
    const normalizedIcon = String(icon ?? '').trim()

    return normalizedIcon || '📌'
  }
}

export default BoardService
