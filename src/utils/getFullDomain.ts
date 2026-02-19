export const fulldomain = typeof window !== 'undefined' ? /:\/\/([^\/]+)/.exec(window?.location?.href)?.[1] : ""
