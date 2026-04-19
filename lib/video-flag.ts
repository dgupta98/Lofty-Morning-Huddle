// Module-level flag — survives component remounts, unaffected by Next.js router
let _pending = false

export const videoFlag = {
  set: () => { _pending = true },
  consume: () => { const v = _pending; _pending = false; return v },
  peek: () => _pending,
}
