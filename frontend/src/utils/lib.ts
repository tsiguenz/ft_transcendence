export default function formatError(message) {
  return typeof message == 'string' ? message : message.join(',\n');
}
