export type FlagEntry = {
  /** Basename, e.g. `flag-of-Poland.png` */
  id: string;
  src: string;
  /** Derived from filename only — see `labelFromFlagFilename`. */
  label: string;
};
