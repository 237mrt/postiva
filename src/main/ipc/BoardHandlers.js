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

function registerBoardHandlers(boardService) {
  registerHandler("boards:list", () => boardService.getAllBoards());

  registerHandler("boards:create", (boardData) =>
    boardService.createBoard(boardData),
  );

  registerHandler("boards:update", (boardId, boardData) =>
    boardService.updateBoard(boardId, boardData),
  );

  registerHandler("boards:delete", (boardId) =>
    boardService.deleteBoard(boardId),
  );
}

export default registerBoardHandlers;
