export function readFromObject(object, field, defaultValue) {
  return object.hasOwnProperty(field) ? object[field] : defaultValue;
}

export function loadFromLocalStorage(key, defaultValue) {
  let val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultValue;
}
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
