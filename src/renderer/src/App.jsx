import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ConfirmDialog from './components/ConfirmDialog'
import RightPanel from './components/RightPanel'
import NoteModal from './components/NoteModal'
import TrashView from './components/TrashView'
import NotesView from './components/NotesView'
import BoardModal from './components/BoardModal'
import ToastNotification from './components/ToastNotification'
import notificationSound from './assets/sounds/postiva-notification.mp3'

const normalizeSearchText = (value) => {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .trim()
}

const isNoteOverdue = (note, referenceTime = Date.now()) => {
  if (note.isCompleted || !note.dueDate) {
    return false
  }

  const dueDateTime = new Date(note.dueDate).getTime()

  if (Number.isNaN(dueDateTime)) {
    return false
  }

  return dueDateTime < referenceTime
}

const searchNotes = (noteList, searchQuery) => {
  const normalizedQuery = normalizeSearchText(searchQuery)

  if (!normalizedQuery) {
    return noteList
  }

  return noteList.filter((note) => {
    const searchableText = [
      note.title,
      ...(Array.isArray(note.content) ? note.content : [note.content])
    ]
      .map(normalizeSearchText)
      .join(' ')

    return searchableText.includes(normalizedQuery)
  })
}

const isSameLocalDay = (dateValue, targetDate = new Date()) => {
  if (!dateValue) {
    return false
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  )
}

const priorityWeights = {
  high: 3,
  normal: 2,
  low: 1
}

const getDateTime = (dateValue, fallbackValue = 0) => {
  if (!dateValue) {
    return fallbackValue
  }

  const dateTime = new Date(dateValue).getTime()

  return Number.isNaN(dateTime) ? fallbackValue : dateTime
}

function App() {
  const [boards, setBoards] = useState([])

  const [editingBoard, setEditingBoard] = useState(null)

  const [currentTime, setCurrentTime] = useState(Date.now())

  const sentNotificationKeys = useRef(new Set())
  const notificationAudioRef = useRef(null)
  const [toastQueue, setToastQueue] = useState([])

  const [sortMode, setSortMode] = useState('updated-desc')

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)

  const [isBoardsLoading, setIsBoardsLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [deletedNotes, setDeletedNotes] = useState([])

  const [activeView, setActiveView] = useState('home')

  const [selectedBoardId, setSelectedBoardId] = useState(null)

  const [boardPendingDelete, setBoardPendingDelete] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  const [selectedNote, setSelectedNote] = useState(null)

  const [notePendingDelete, setNotePendingDelete] = useState(null)

  const [notePendingPermanentDelete, setNotePendingPermanentDelete] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const [isTrashLoading, setIsTrashLoading] = useState(true)

  const [appError, setAppError] = useState('')

  const activeToast = toastQueue.length > 0 ? toastQueue[0] : null

  useEffect(() => {
    loadNotes()
    loadDeletedNotes()
    loadBoards()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 60_000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  // Bildirim sesi
  useEffect(() => {
    const audio = new Audio(notificationSound)

    audio.preload = 'auto'
    audio.volume = 0.45

    notificationAudioRef.current = audio

    return () => {
      audio.pause()
      notificationAudioRef.current = null
    }
  }, [])

  const playNotificationSound = useCallback(async () => {
    const audio = notificationAudioRef.current

    if (!audio) {
      return
    }

    try {
      audio.currentTime = 0

      await audio.play()
    } catch (error) {
      console.warn('[Postiva] Bildirim sesi oynatılamadı:', error)
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const showDueNotifications = async () => {
      /*
       * Not zamanı geçtikten sonra iki dakika
       * boyunca bildirim için uygun kabul edilir.
       */
      const notificationWindow = 2 * 60 * 1000

      const dueNotes = notes.filter((note) => {
        if (note.isCompleted || !note.dueDate) {
          return false
        }

        const dueDateTime = new Date(note.dueDate).getTime()

        if (Number.isNaN(dueDateTime)) {
          return false
        }

        const elapsedTime = currentTime - dueDateTime

        return elapsedTime >= 0 && elapsedTime <= notificationWindow
      })

      for (const note of dueNotes) {
        const notificationKey = `${note.id}:${note.dueDate}`

        if (sentNotificationKeys.current.has(notificationKey)) {
          continue
        }

        sentNotificationKeys.current.add(notificationKey)

        await playNotificationSound()

        const isPostivaFocused = document.visibilityState === 'visible' && document.hasFocus()

        /*
         * Postiva ekranda ve odaktaysa
         * özel tasarım bildirimi göster.
         */
        if (isPostivaFocused) {
          setToastQueue((currentQueue) => {
            const alreadyQueued = currentQueue.some((item) => item.key === notificationKey)

            if (alreadyQueued) {
              return currentQueue
            }

            return [
              ...currentQueue,
              {
                key: notificationKey,
                note
              }
            ]
          })

          continue
        }

        /*
         * Uygulama arka plandaysa
         * Windows bildirimini göster.
         */
        try {
          if (!window.api?.notifications?.show) {
            throw new Error('Bildirim API bağlantısı bulunamadı.')
          }

          const response = await window.api.notifications.show({
            title: 'Postiva',
            body: `"${note.title}" notunun zamanı geldi.`,
            silent: true
          })

          if (!response?.ok) {
            throw new Error(response?.error ?? 'Bildirim gösterilemedi.')
          }
        } catch (error) {
          sentNotificationKeys.current.delete(notificationKey)

          console.error('[Postiva] Hatırlatma bildirimi gönderilemedi:', error)
        }
      }
    }

    showDueNotifications()
  }, [notes, currentTime, isLoading, playNotificationSound])

  useEffect(() => {
    setToastQueue((currentQueue) =>
      currentQueue.filter((notification) => {
        const currentNote = notes.find((note) => note.id === notification.note.id)

        return currentNote && !currentNote.isCompleted
      })
    )
  }, [notes])

  const unwrapResponse = (response) => {
    if (!response?.ok) {
      throw new Error(response?.error ?? 'İşlem tamamlanamadı.')
    }

    return response.data
  }

  const ensureNotesApi = () => {
    if (!window.api?.notes) {
      throw new Error('Postiva dosya sistemi bağlantısı bulunamadı.')
    }
  }

  const loadNotes = async () => {
    setIsLoading(true)

    try {
      ensureNotesApi()

      const response = await window.api.notes.list()

      setNotes(unwrapResponse(response))
    } catch (error) {
      console.error(error)
      setAppError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeletedNotes = async () => {
    setIsTrashLoading(true)

    try {
      ensureNotesApi()

      const response = await window.api.notes.listDeleted()

      setDeletedNotes(unwrapResponse(response))
    } catch (error) {
      console.error(error)
      setAppError(error.message)
    } finally {
      setIsTrashLoading(false)
    }
  }

  const loadBoards = async () => {
    setIsBoardsLoading(true)

    try {
      if (!window.api?.boards) {
        throw new Error('Postiva pano sistemi bağlantısı bulunamadı.')
      }

      const response = await window.api.boards.list()

      const savedBoards = unwrapResponse(response)

      setBoards(Array.isArray(savedBoards) ? savedBoards : [])
    } catch (error) {
      console.error('[Postiva] Panolar yüklenemedi:', error)

      setAppError(error.message)
    } finally {
      setIsBoardsLoading(false)
    }
  }

  const todayNotes = useMemo(() => {
    return notes.filter((note) => !note.isCompleted && isSameLocalDay(note.dueDate))
  }, [notes])

  const upcomingNotes = useMemo(() => {
    const endOfToday = new Date()

    endOfToday.setHours(23, 59, 59, 999)

    return notes
      .filter((note) => {
        if (note.isCompleted || !note.dueDate) {
          return false
        }

        const dueDate = new Date(note.dueDate)

        return !Number.isNaN(dueDate.getTime()) && dueDate > endOfToday
      })
      .sort((firstNote, secondNote) => new Date(firstNote.dueDate) - new Date(secondNote.dueDate))
  }, [notes])

  const completedNotes = useMemo(() => {
    return notes.filter((note) => note.isCompleted)
  }, [notes])

  const overdueNotes = useMemo(() => {
    return notes
      .filter((note) => isNoteOverdue(note, currentTime))
      .sort((firstNote, secondNote) => new Date(firstNote.dueDate) - new Date(secondNote.dueDate))
  }, [notes, currentTime])

  const boardsWithCounts = useMemo(() => {
    return boards.map((board) => ({
      ...board,

      noteCount: notes.filter((note) => note.boardId === board.id).length
    }))
  }, [boards, notes])

  const currentBoard = useMemo(() => {
    return boards.find((board) => board.id === selectedBoardId) ?? null
  }, [boards, selectedBoardId])

  const currentViewNotes = useMemo(() => {
    switch (activeView) {
      case 'today':
        return todayNotes

      case 'overdue':
        return overdueNotes

      case 'upcoming':
        return upcomingNotes

      case 'completed':
        return completedNotes

      case 'board':
        return notes.filter((note) => note.boardId === selectedBoardId)

      default:
        return notes
    }
  }, [activeView, notes, todayNotes, upcomingNotes, completedNotes, selectedBoardId])

  const filteredNotes = useMemo(() => {
    const searchedNotes = searchNotes(currentViewNotes, searchQuery)

    return [...searchedNotes].sort((firstNote, secondNote) => {
      /*
       * Sabitlenen notlar her zaman
       * listenin en üstünde bulunur.
       */
      if (Boolean(firstNote.isPinned) !== Boolean(secondNote.isPinned)) {
        return Number(Boolean(secondNote.isPinned)) - Number(Boolean(firstNote.isPinned))
      }

      switch (sortMode) {
        case 'created-desc':
          return getDateTime(secondNote.createdAt) - getDateTime(firstNote.createdAt)

        case 'due-asc': {
          const firstHasDueDate = Boolean(firstNote.dueDate)

          const secondHasDueDate = Boolean(secondNote.dueDate)

          if (firstHasDueDate !== secondHasDueDate) {
            return firstHasDueDate ? -1 : 1
          }

          if (!firstHasDueDate && !secondHasDueDate) {
            return getDateTime(secondNote.updatedAt) - getDateTime(firstNote.updatedAt)
          }

          return (
            getDateTime(firstNote.dueDate, Number.MAX_SAFE_INTEGER) -
            getDateTime(secondNote.dueDate, Number.MAX_SAFE_INTEGER)
          )
        }

        case 'priority-desc': {
          const firstPriority = priorityWeights[firstNote.priority] ?? priorityWeights.normal

          const secondPriority = priorityWeights[secondNote.priority] ?? priorityWeights.normal

          if (firstPriority !== secondPriority) {
            return secondPriority - firstPriority
          }

          return getDateTime(secondNote.updatedAt) - getDateTime(firstNote.updatedAt)
        }

        case 'title-asc':
          return String(firstNote.title ?? '').localeCompare(
            String(secondNote.title ?? ''),
            'tr-TR'
          )

        case 'updated-desc':
        default:
          return getDateTime(secondNote.updatedAt) - getDateTime(firstNote.updatedAt)
      }
    })
  }, [currentViewNotes, searchQuery, sortMode])

  const filteredDeletedNotes = useMemo(() => {
    return searchNotes(deletedNotes, searchQuery)
  }, [deletedNotes, searchQuery])

  const viewSettings = {
    home: {
      title: 'Notların',
      icon: '✦',
      emptyTitle: 'Henüz notun yok',
      emptyMessage: 'İlk post-it notunu oluşturarak başlayabilirsin.'
    },

    today: {
      title: 'Bugün',
      icon: '📅',
      emptyTitle: 'Bugün için görev yok',
      emptyMessage: 'Bugüne ait son tarihi bulunan aktif bir not yok.'
    },

    overdue: {
      title: 'Gecikenler',
      icon: '⚠️',
      emptyTitle: 'Geciken not yok',
      emptyMessage: 'Harika! Son tarihi geçmiş aktif bir not bulunmuyor.'
    },

    upcoming: {
      title: 'Yaklaşanlar',
      icon: '⏰',
      emptyTitle: 'Yaklaşan görev yok',
      emptyMessage: 'İleriki tarihlere planlanmış bir not bulunmuyor.'
    },

    completed: {
      title: 'Tamamlananlar',
      icon: '✅',
      emptyTitle: 'Tamamlanan not yok',
      emptyMessage: 'Tamamladığın notlar burada görünecek.'
    }
  }

  const navigateTo = (view) => {
    setActiveView(view)
    setSelectedBoardId(null)
    setSearchQuery('')
    setAppError('')

    if (view === 'trash') {
      loadDeletedNotes()
    }
  }

  const openBoardView = (boardId) => {
    setSelectedBoardId(boardId)
    setActiveView('board')
    setSearchQuery('')
    setAppError('')
  }

  const openNewNoteModal = () => {
    setSelectedNote(null)
    setIsNoteModalOpen(true)
  }

  const openBoardModal = () => {
    setEditingBoard(null)
    setIsBoardModalOpen(true)
  }

  const openEditBoardModal = (board) => {
    setEditingBoard(board)
    setIsBoardModalOpen(true)
  }

  const closeBoardModal = () => {
    setIsBoardModalOpen(false)
    setEditingBoard(null)
  }

  const saveBoard = async (boardData) => {
    setAppError('')

    try {
      if (!window.api?.boards) {
        throw new Error('Postiva pano sistemi bağlantısı bulunamadı.')
      }

      if (editingBoard) {
        const response = await window.api.boards.update(editingBoard.id, boardData)

        const updatedBoard = unwrapResponse(response)

        setBoards((currentBoards) =>
          currentBoards.map((board) => (board.id === updatedBoard.id ? updatedBoard : board))
        )
      } else {
        const response = await window.api.boards.create(boardData)

        const createdBoard = unwrapResponse(response)

        setBoards((currentBoards) => [...currentBoards, createdBoard])
      }

      closeBoardModal()
    } catch (error) {
      console.error('[Postiva] Pano kaydedilemedi:', error)

      setAppError(error.message)
    }
  }

  const requestDeleteBoard = (board) => {
    setBoardPendingDelete(board)
    closeBoardModal()
  }

  const cancelDeleteBoard = () => {
    setBoardPendingDelete(null)
  }

  const confirmDeleteBoard = async () => {
    if (!boardPendingDelete) {
      return
    }

    setAppError('')

    try {
      if (!window.api?.boards) {
        throw new Error('Postiva pano sistemi bağlantısı bulunamadı.')
      }

      const deletedBoardId = boardPendingDelete.id

      const response = await window.api.boards.delete(deletedBoardId)

      unwrapResponse(response)

      setBoards((currentBoards) => currentBoards.filter((board) => board.id !== deletedBoardId))

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.boardId === deletedBoardId
            ? {
                ...note,
                boardId: null
              }
            : note
        )
      )

      if (activeView === 'board' && selectedBoardId === deletedBoardId) {
        setActiveView('home')
        setSelectedBoardId(null)
        setSearchQuery('')
      }

      setBoardPendingDelete(null)
    } catch (error) {
      console.error('[Postiva] Pano silinemedi:', error)

      setAppError(error.message)
      setBoardPendingDelete(null)
    }
  }

  const openEditNoteModal = (note) => {
    setSelectedNote(note)
    setIsNoteModalOpen(true)
  }

  const closeNoteModal = () => {
    setIsNoteModalOpen(false)
    setSelectedNote(null)
  }

  const saveNote = async (noteData) => {
    setAppError('')

    try {
      ensureNotesApi()

      if (selectedNote) {
        const response = await window.api.notes.update(selectedNote.id, noteData)

        const updatedNote = unwrapResponse(response)

        setNotes((currentNotes) =>
          currentNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        )
      } else {
        const response = await window.api.notes.create({
          ...noteData,
          decoration: '✦'
        })

        const createdNote = unwrapResponse(response)

        setNotes((currentNotes) => [...currentNotes, createdNote])
      }

      closeNoteModal()
    } catch (error) {
      console.error(error)
      setAppError(error.message)
    }
  }

  const toggleNoteCompleted = async (note) => {
    setAppError('')

    try {
      ensureNotesApi()

      const response = await window.api.notes.update(note.id, {
        isCompleted: !note.isCompleted
      })

      const updatedNote = unwrapResponse(response)

      setNotes((currentNotes) =>
        currentNotes.map((item) => (item.id === updatedNote.id ? updatedNote : item))
      )
    } catch (error) {
      console.error(error)
      setAppError(error.message)
    }
  }

  const closeCurrentToast = () => {
    setToastQueue((currentQueue) => currentQueue.slice(1))
  }

  const openToastNote = (note) => {
    closeCurrentToast()

    const currentNote = notes.find((item) => item.id === note.id) ?? note

    openEditNoteModal(currentNote)
  }

  const completeToastNote = async (note) => {
    const currentNote = notes.find((item) => item.id === note.id) ?? note

    await toggleNoteCompleted(currentNote)

    closeCurrentToast()
  }

  const toggleNotePinned = async (note) => {
    setAppError('')

    try {
      ensureNotesApi()

      const response = await window.api.notes.update(note.id, {
        isPinned: !note.isPinned
      })

      const updatedNote = unwrapResponse(response)

      setNotes((currentNotes) =>
        currentNotes.map((item) => (item.id === updatedNote.id ? updatedNote : item))
      )
    } catch (error) {
      console.error('[Postiva] Not sabitlenemedi:', error)

      setAppError(error.message)
    }
  }

  const requestDeleteNote = (note) => {
    setNotePendingDelete(note)
  }

  const cancelDeleteNote = () => {
    setNotePendingDelete(null)
  }

  const confirmDeleteNote = async () => {
    if (!notePendingDelete) {
      return
    }

    try {
      ensureNotesApi()

      const response = await window.api.notes.moveToTrash(notePendingDelete.id)

      const deletedNote = unwrapResponse(response)

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== deletedNote.id))

      setDeletedNotes((currentNotes) => [
        ...currentNotes.filter((note) => note.id !== deletedNote.id),
        deletedNote
      ])

      setNotePendingDelete(null)
      closeNoteModal()
    } catch (error) {
      console.error(error)
      setAppError(error.message)
      setNotePendingDelete(null)
    }
  }

  const restoreNote = async (note) => {
    setAppError('')

    try {
      ensureNotesApi()

      const response = await window.api.notes.restore(note.id)

      const restoredNote = unwrapResponse(response)

      setDeletedNotes((currentNotes) => currentNotes.filter((item) => item.id !== restoredNote.id))

      setNotes((currentNotes) => [
        ...currentNotes.filter((item) => item.id !== restoredNote.id),
        restoredNote
      ])
    } catch (error) {
      console.error(error)
      setAppError(error.message)
    }
  }

  const requestPermanentDelete = (note) => {
    setNotePendingPermanentDelete(note)
  }

  const cancelPermanentDelete = () => {
    setNotePendingPermanentDelete(null)
  }

  const confirmPermanentDelete = async () => {
    if (!notePendingPermanentDelete) {
      return
    }

    try {
      ensureNotesApi()

      const response = await window.api.notes.permanentlyDelete(notePendingPermanentDelete.id)

      unwrapResponse(response)

      setDeletedNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== notePendingPermanentDelete.id)
      )

      setNotePendingPermanentDelete(null)
    } catch (error) {
      console.error(error)
      setAppError(error.message)
      setNotePendingPermanentDelete(null)
    }
  }

  const currentSettings =
    activeView === 'board'
      ? {
          title: currentBoard?.name ?? 'Pano',
          icon: currentBoard?.icon ?? '📌',
          emptyTitle: 'Bu pano henüz boş',
          emptyMessage: currentBoard
            ? `${currentBoard.name} panosuna ilk notunu ekleyebilirsin.`
            : 'Bu panoya henüz bir not eklenmemiş.'
        }
      : (viewSettings[activeView] ?? viewSettings.home)

  const isSecondaryView = activeView !== 'home'

  return (
    <div className={`app ${isSecondaryView ? 'app-secondary-view' : ''}`}>
      <Sidebar
        boards={boardsWithCounts}
        activeView={activeView}
        selectedBoardId={selectedBoardId}
        counts={{
          today: todayNotes.length,
          upcoming: upcomingNotes.length,
          completed: completedNotes.length,
          overdue: overdueNotes.length,
          trash: deletedNotes.length
        }}
        onNavigate={navigateTo}
        onCreateBoard={openBoardModal}
        onSelectBoard={openBoardView}
        onEditBoard={openEditBoardModal}
      />

      <main className="workspace">
        <Topbar
          onNewNote={openNewNoteModal}
          showNewNote={activeView === 'home' || activeView === 'board'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={
            activeView === 'trash'
              ? "Çöp Kutusu'nda ara..."
              : `${currentSettings.title} içinde ara...`
          }
        />

        {appError && (
          <div className="workspace-error-wrap">
            <div className="app-error">
              <span>!</span>
              <p>{appError}</p>

              <button type="button" onClick={() => setAppError('')}>
                ×
              </button>
            </div>
          </div>
        )}

        {activeView === 'trash' ? (
          <TrashView
            notes={filteredDeletedNotes}
            totalCount={deletedNotes.length}
            searchQuery={searchQuery}
            isLoading={isTrashLoading}
            onRestore={restoreNote}
            onPermanentDelete={requestPermanentDelete}
          />
        ) : (
          <NotesView
            title={currentSettings.title}
            icon={currentSettings.icon}
            notes={filteredNotes}
            boards={boards}
            totalCount={currentViewNotes.length}
            searchQuery={searchQuery}
            isLoading={isLoading}
            emptyTitle={currentSettings.emptyTitle}
            emptyMessage={currentSettings.emptyMessage}
            showNewNoteButton={activeView === 'home' || activeView === 'board'}
            showNightMessage={activeView === 'home'}
            onNewNote={openNewNoteModal}
            onEdit={openEditNoteModal}
            onToggleComplete={toggleNoteCompleted}
            onTogglePin={toggleNotePinned}
            sortMode={sortMode}
            onSortChange={setSortMode}
            currentTime={currentTime}
          />
        )}
      </main>

      {activeView === 'home' && (
        <RightPanel
          todayNotes={todayNotes}
          upcomingNotes={upcomingNotes}
          onEdit={openEditNoteModal}
          onToggleComplete={toggleNoteCompleted}
          onShowToday={() => navigateTo('today')}
          onShowUpcoming={() => navigateTo('upcoming')}
        />
      )}
      {activeToast && (
        <ToastNotification
          key={activeToast.key}
          notification={activeToast}
          onClose={closeCurrentToast}
          onOpen={openToastNote}
          onComplete={completeToastNote}
        />
      )}

      {isBoardModalOpen && (
        <BoardModal
          key={editingBoard?.id ?? 'new-board'}
          board={editingBoard}
          onClose={closeBoardModal}
          onSave={saveBoard}
          onDelete={requestDeleteBoard}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          key={selectedNote?.id ?? 'new-note'}
          note={selectedNote}
          boards={boards}
          defaultBoardId={activeView === 'board' ? selectedBoardId : null}
          onClose={closeNoteModal}
          onSave={saveNote}
          onDelete={requestDeleteNote}
        />
      )}

      {notePendingDelete && (
        <ConfirmDialog
          title="Not çöpe taşınsın mı?"
          message={`"${notePendingDelete.title}" notunu Çöp Kutusu'na taşımak istediğine emin misin?`}
          hint="Notu daha sonra Çöp Kutusu'ndan geri yükleyebilirsin."
          confirmText="Çöpe Taşı"
          cancelText="Vazgeç"
          onConfirm={confirmDeleteNote}
          onCancel={cancelDeleteNote}
        />
      )}

      {boardPendingDelete && (
        <ConfirmDialog
          title="Pano silinsin mi?"
          message={`"${boardPendingDelete.name}" panosunu silmek istediğine emin misin?`}
          hint="Panodaki notlar silinmeyecek, Panosuz Not haline gelecek."
          confirmText="Panoyu Sil"
          cancelText="Vazgeç"
          onConfirm={confirmDeleteBoard}
          onCancel={cancelDeleteBoard}
        />
      )}

      {notePendingPermanentDelete && (
        <ConfirmDialog
          title="Kalıcı olarak silinsin mi?"
          message={`"${notePendingPermanentDelete.title}" tamamen silinecek.`}
          hint="Bu işlem geri alınamaz."
          confirmText="Kalıcı Sil"
          cancelText="Vazgeç"
          onConfirm={confirmPermanentDelete}
          onCancel={cancelPermanentDelete}
        />
      )}
    </div>
  )
}

export default App
