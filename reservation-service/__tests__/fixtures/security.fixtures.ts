export const sqlInjectionPayloads = {
  dropTable: "'; DROP TABLE reservations; --",
  deleteAll: "1; DELETE FROM reservations WHERE 1=1; --",
  orTrue: "' OR '1'='1",
  unionSelect: "1 UNION SELECT * FROM customers --",
  insertHack: "'; INSERT INTO reservations VALUES ('hack'); --",
  updateHack: "1; UPDATE reservations SET status='hacked'; --",
  commentBypass: "admin'--",
  nestedQuotes: "'''",
  unicodeBypass: "\\u0027 OR 1=1--",
};

export const sqlInjectionPayloadsArray = Object.values(sqlInjectionPayloads);

export const maliciousDateInputs = [
  "2024-01-01'; DROP TABLE reservations; --",
  "2024-01-01 OR 1=1",
  "'; DELETE FROM customers; --",
];

export const maliciousTimeInputs = [
  "18:00:00'; DELETE FROM reservations; --",
  "18:00:00 UNION SELECT * FROM customers",
  "' OR 1=1 --",
];

export const maliciousIdInputs = [
  "'; DROP TABLE reservations; --",
  "1 OR 1=1",
  "1; UPDATE reservations SET status='hacked'",
  "' UNION SELECT * FROM customers --",
];

export const maliciousCustomerInputs = {
  name: "'; DROP TABLE customers; --",
  email: "hacker@test.com'; DELETE FROM customers; --",
  preferences: "' OR 1=1 --",
};
