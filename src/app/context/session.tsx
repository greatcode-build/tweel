"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "../../../utils/supabase/client";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session: initialSession,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(initialSession);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
