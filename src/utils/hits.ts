export type HoverInfo = { id: string; name: string; role: string } | null;

let hover: HoverInfo = null;
const hoverListeners = new Set<() => void>();

export const hoverStore = {
  get: () => hover,
  set(next: HoverInfo) {
    if (hover?.id === next?.id && hover?.role === next?.role) return;
    hover = next;
    hoverListeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    hoverListeners.add(listener);
    return () => {
      hoverListeners.delete(listener);
    };
  },
};

export const hitAt = new Map<string, number>();

const hitListeners = new Set<(id: string) => void>();

export const stageBus = {
  on(listener: (id: string) => void) {
    hitListeners.add(listener);
    return () => {
      hitListeners.delete(listener);
    };
  },
  emit(id: string) {
    hitListeners.forEach((listener) => listener(id));
  },
};

export const pointer = {
  mx: 0,
  my: 0,
  scroll: 0,
  kick: 0,
};

export const labelNode: { current: HTMLDivElement | null } = { current: null };

export function markHit(id: string) {
  hitAt.set(id, performance.now());
  pointer.kick = id.includes("will") ? 1 : 0.72;
  stageBus.emit(id);
}
