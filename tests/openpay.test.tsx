import assert from "node:assert/strict";
import {
  getCardBrand,
  getExpectedCvvLength,
  getFriendlyPaymentError,
  isExpiryInPast,
} from "../src/components/PaymentModal";

const tests: string[] = [];
function check(name: string, fn: () => void) {
  fn();
  tests.push(name);
  console.log(`PASS ${name}`);
}

check("Openpay: 4111111111111111 se reconoce como Visa", () => {
  assert.equal(getCardBrand("4111111111111111"), "visa");
  assert.equal(getExpectedCvvLength("4111111111111111"), 3);
});

check("Openpay: American Express exige CVV de 4 dígitos", () => {
  assert.equal(getCardBrand("345678000000007"), "amex");
  assert.equal(getExpectedCvvLength("345678000000007"), 4);
});

check("Openpay: códigos 3001-3005 muestran mensaje específico", () => {
  assert.equal(getFriendlyPaymentError(3001).title, "Tarjeta rechazada");
  assert.equal(getFriendlyPaymentError(3002).title, "Tarjeta expirada");
  assert.equal(getFriendlyPaymentError(3003).title, "Fondos insuficientes");
  assert.equal(getFriendlyPaymentError(3004).title, "Tarjeta robada");
  assert.equal(getFriendlyPaymentError(3005).title, "Tarjeta rechazada por fraude/antifraude");
});

check("Openpay Sandbox: tarjetas de certificación tienen resultado determinístico", () => {
  assert.equal(getFriendlyPaymentError(undefined, "", "4222222222222220", true).title, "Tarjeta rechazada");
  assert.equal(getFriendlyPaymentError(undefined, "", "4000000000000069", true).title, "Tarjeta expirada");
  assert.equal(getFriendlyPaymentError(undefined, "", "4444444444444448", true).title, "Fondos insuficientes");
  assert.equal(getFriendlyPaymentError(undefined, "", "4000000000000119", true).title, "Tarjeta robada");
});

check("Openpay: fecha expirada se bloquea", () => {
  assert.equal(isExpiryInPast("01", "20"), true);
  assert.equal(isExpiryInPast("13", "30"), true);
});

console.log(`\n${tests.length} pruebas de contrato Openpay aprobadas.`);
