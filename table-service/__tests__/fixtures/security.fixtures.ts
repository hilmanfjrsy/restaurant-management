export const sqlInjectionPayloads = {
  dropTable: "'; DROP TABLE tables; --",
  deleteAll: "1; DELETE FROM tables WHERE 1=1; --",
  orTrue: "' OR '1'='1",
  unionSelect: "1 UNION SELECT * FROM customers --",
  insertHack: "'; INSERT INTO tables VALUES ('hack'); --",
  updateHack: "1; UPDATE tables SET status='hacked'; --",
  commentBypass: "admin'--",
  nestedQuotes: "'''",
  unicodeBypass: "\\u0027 OR 1=1--",
};

export const sqlInjectionPayloadsArray = Object.values(sqlInjectionPayloads);

export const maliciousDateInputs = [
  "2024-01-01'; DROP TABLE reservations; --",
  "2024-01-01 OR 1=1",
  "'; DELETE FROM tables; --",
];

export const maliciousTimeInputs = [
  "18:00:00'; DELETE FROM tables; --",
  "18:00:00 UNION SELECT * FROM customers",
  "' OR 1=1 --",
];

export const maliciousIdInputs = [
  "'; DROP TABLE tables; --",
  "1 OR 1=1",
  "1; UPDATE tables SET status='hacked'",
  "' UNION SELECT * FROM customers --",
];
