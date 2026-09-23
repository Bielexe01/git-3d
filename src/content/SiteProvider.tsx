import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { defaultContent } from "./defaults";
import { fileTooBig } from "./files";
import { normalize } from "./normalize";
import type { SiteContent } from "./types";

type Notice = { tone: "ok" | "err"; text: string } | null;

type SiteApi = {
  content: SiteContent;
  draft: SiteContent;
  revision: number;
  dirty: boolean;
  saving: boolean;
  uploading: boolean;
  notice: Notice;
  edit: (recipe: (current: SiteContent) => SiteContent) => void;
  save: () => Promise<void>;
  upload: (file: File) => Promise<string>;
};

const SiteContext = createContext<SiteApi | null>(null);

async function payloadOf(response: Response): Promise<{ error?: string; url?: string }> {
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new Error("Salvar só funciona com o site aberto neste computador.");
  }
  return (await response.json()) as { error?: string; url?: string };
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(defaultContent);
  const [draft, setDraft] = useState(defaultContent);
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    let live = true;
    fetch("/content/site.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("sem conteúdo"))))
      .then((json) => {
        if (!live) return;
        const next = normalize(json);
        setContent(next);
        if (!dirtyRef.current) {
          setDraft(next);
          setRevision((value) => value + 1);
        }
      })
      .catch(() => {
        /* o conteúdo inicial continua na página */
      });
    return () => {
      live = false;
    };
  }, []);

  const edit = useCallback((recipe: (current: SiteContent) => SiteContent) => {
    dirtyRef.current = true;
    setDraft((current) => recipe(current));
    setDirty(true);
    setNotice(null);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(normalize(draft)),
      });
      const body = await payloadOf(response);
      if (!response.ok) throw new Error(body.error || "Não foi possível salvar.");
      const saved = normalize(body);
      dirtyRef.current = false;
      setContent(saved);
      setDraft(saved);
      setDirty(false);
      setRevision((value) => value + 1);
      setNotice({ tone: "ok", text: "Salvo neste computador." });
    } catch (error) {
      setNotice({
        tone: "err",
        text: error instanceof Error ? error.message : "Não foi possível salvar.",
      });
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const upload = useCallback(async (file: File) => {
    const tooBig = fileTooBig(file);
    if (tooBig) {
      setNotice({ tone: "err", text: tooBig });
      throw new Error(tooBig);
    }
    setUploading(true);
    setNotice({ tone: "ok", text: "Enviando arquivo…" });
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": file.type || "application/octet-stream",
          "x-filename": encodeURIComponent(file.name || "arquivo"),
        },
        body: file,
      });
      const body = await payloadOf(response);
      if (!response.ok || typeof body.url !== "string") {
        throw new Error(body.error || "Não foi possível enviar o arquivo.");
      }
      setNotice(null);
      return body.url;
    } catch (error) {
      const text = error instanceof Error ? error.message : "Não foi possível enviar o arquivo.";
      setNotice({ tone: "err", text });
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const api = useMemo<SiteApi>(
    () => ({ content, draft, revision, dirty, saving, uploading, notice, edit, save, upload }),
    [content, draft, revision, dirty, saving, uploading, notice, edit, save, upload],
  );

  return <SiteContext.Provider value={api}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("O conteúdo do site não está disponível.");
  return value;
}
