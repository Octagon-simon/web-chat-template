import { useCallback, useState } from "react";

import { initialSearch } from "@/lib/views";

export function useDialogs() {
  const [searchOpen, setSearchOpen] = useState(initialSearch);
  const [threadMenuId, setThreadMenuId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const closeAll = useCallback(() => {
    setSearchOpen(false);
    setThreadMenuId(null);
    setShareId(null);
    setArchiveOpen(false);
    setShortcutsOpen(false);
  }, []);

  return {
    searchOpen,
    setSearchOpen,
    threadMenuId,
    setThreadMenuId,
    shareId,
    setShareId,
    archiveOpen,
    setArchiveOpen,
    shortcutsOpen,
    setShortcutsOpen,
    closeAll,
  };
}
