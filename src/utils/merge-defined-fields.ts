export function mergeDefinedFields<T extends object>(base: T, patch: Partial<T>): T {
  const onlyDefinedFields = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as Partial<T>;

  return { ...base, ...onlyDefinedFields };
}
