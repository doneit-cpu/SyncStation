# SyncStation MVP Development Plan

## 1. UI/UX Improvements
- **Goal:** Resolve "raw" layout (components stacking in corner).
- **Actions:**
    - Create a main layout container (using Flexbox/Grid) to manage component positioning.
    - Standardize styling using CSS modules or a shared CSS file.
    - Apply `max-width` to the main container for responsiveness.
    - Implement visual feedback (Toast/Alerts) for actions (joining/creating rooms).

## 2. Code Refactoring
- **Goal:** Improve maintainability and logical separation.
- **Actions:**
    - Move connection/room logic out of `App.tsx` and into a dedicated `Dashboard` or `Room` component.
    - Clean up unused imports and remove debugging comments.
    - Separate the "Join/Create" logic from the "Active Room" UI.

## 3. Git Preparation
- **Goal:** Ensure a clean, professional repository.
- **Actions:**
    - Verify `.gitignore` covers `node_modules`, `dist`, and environment files for both `client` and `server`.
    - Perform atomic commits (e.g., `feat(ui): implement base layout`).
    - Finalize functional verification before the first major push.

## 4. Observations & Technical Notes (Client)
- **Codebase Cleanliness:** `App.tsx` contains significant debugging comments and "to-do" style commentary that should be cleaned up.
- **Error Handling:** `context/syncontext.tsx` needs more robust error handling within socket event listeners (e.g., `done-joinreq` has commented-out TODOs for user feedback).
- **Socket Management:** The `SyncProvider` in `context/syncontext.tsx` manages the socket connection, which is appropriate, but the event cleanup and error handling need refinement for a better user experience.
- **Component Issues:**
    - `components/alert.tsx` appears to have a recursive rendering issue (`<Alert></Alert>` inside `Alert`).
    - `components/clipboard.tsx` has logic that might cause unnecessary API calls/duplicate sends to the server and needs review.
    - `components/inputtext.tsx` mixes UI rendering with state-updating logic for two distinct purposes ("Username" vs "Room-code"), which should be decoupled.
    - `components/sharedroominfo.tsx` contains hardcoded styling and logic that could be better handled by a cleaner layout/CSS structure.
- **Types:** `types/global.d.ts` has an `electronAPI` definition, suggesting potential (but currently unused) plans for an Electron-based desktop application.

## 5. Server Observations & Technical Notes
- **Clipboard Management (`controllers/clipboard.ts`):** The server uses `clipboardy` to manipulate the *server's* clipboard. This is a very specific design choice (likely intended for the server to run on a local machine to act as a bridge), rather than just facilitating data transfer between clients.
- **Room Management (`socket.ts`):** The `pre-joinreq` logic uses `io.of("/").adapter.rooms.get(data)` to check room existence, which is a good approach, but the error handling and client-server feedback loop for successful/failed joins could be more robust.
- **Routing:** `routes/noderoutes.ts` is currently unused and should either be implemented to handle API routes or removed to clean up the codebase.
- **Tunneling:** `server.ts` uses `tunnelmole` to expose the server publicly on startup. This is convenient for development but poses security risks and should be configurable or disabled in a production environment.
- **Project Structure:** The server serves the client's `dist` folder. This coupling means the server and client need to be built together or kept in sync.
