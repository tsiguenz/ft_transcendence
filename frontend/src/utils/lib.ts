export function formatError(message) {
  return typeof message == 'string' ? message : message.join(',\n');
}

export function convertDate(dateToConvert) {
  const lastCoUTC = new Date(dateToConvert).getTime();
  return new Date(lastCoUTC).toLocaleString();
}
