// Full Firestore ID keeps references unique, including older reports, without a counter service.
export function reportReference(id: string) {
  return `CF-${id}`;
}
