export const filterObject = <
  U extends string | number | symbol,
  V,
  T extends Record<U, V>,
>(
  obj: T,
) => {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
};
