import dayjs from 'dayjs';

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  return dayjs(timeString).format('h:mm A');
}

export function formatDate(dateString) {
  return dayjs(dateString).format('dddd, MMMM D, YYYY');
}

export function getCurrentDateFormatted() {
  return dayjs().format('dddd, MMMM D, YYYY');
}

export function getFirstName(fullName) {
  return fullName.split(' ')[0];
}