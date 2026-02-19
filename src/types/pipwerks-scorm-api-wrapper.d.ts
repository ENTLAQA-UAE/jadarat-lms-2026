declare module 'pipwerks-scorm-api-wrapper' {
  export const SCORM: {
    init: () => boolean;
    get: (param: string) => string;
    set: (param: string, value: string) => boolean;
    save: () => boolean;
    quit: () => boolean;
    connection: { isActive: boolean };
  };
} 