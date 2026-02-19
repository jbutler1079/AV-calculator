/**
 * AV Calculator – JavaScript Logic
 *
 * Panels:
 *  1. Assessed Value  – calculates assessed value and annual property tax
 *  2. Property Tax    – back-solves the mill rate needed to hit a target tax
 *  3. Mortgage Est.   – estimates monthly mortgage payment (PITI)
 */

"use strict";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a number as USD currency string.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage string (2 decimal places).
 * @param {number} value
 * @returns {string}
 */
function formatPercent(value) {
  return value.toFixed(2) + "%";
}

/**
 * Parse a raw string from an input to a positive finite number.
 * Returns NaN on failure.
 * @param {string} raw
 * @returns {number}
 */
function parsePositive(raw) {
  const n = parseFloat(raw.replace(/,/g, ""));
  return isFinite(n) && n >= 0 ? n : NaN;
}

/**
 * Show or hide an element using the "visible" class.
 * @param {HTMLElement} el
 * @param {boolean} show
 */
function setVisible(el, show) {
  el.classList.toggle("visible", show);
}

// ── Tab switching ────────────────────────────────────────────────────────────

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

// ── Panel 1: Assessed Value ──────────────────────────────────────────────────

(function initAssessedValue() {
  const form = document.getElementById("av-form");
  const resultsEl = document.getElementById("av-results");
  const errorEl = document.getElementById("av-error");

  const fields = {
    marketValue:    document.getElementById("av-market-value"),
    assessRate:     document.getElementById("av-assess-rate"),
    millRate:       document.getElementById("av-mill-rate"),
    exemption:      document.getElementById("av-exemption"),
  };

  const outputs = {
    assessedValue:  document.getElementById("av-out-assessed"),
    taxableValue:   document.getElementById("av-out-taxable"),
    annualTax:      document.getElementById("av-out-annual"),
    monthlyTax:     document.getElementById("av-out-monthly"),
    effectiveRate:  document.getElementById("av-out-effective"),
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
  });

  document.getElementById("av-reset").addEventListener("click", () => {
    form.reset();
    setVisible(resultsEl, false);
    setVisible(errorEl, false);
    clearInvalid();
  });

  function clearInvalid() {
    Object.values(fields).forEach((f) => f.classList.remove("invalid"));
  }

  function calculate() {
    clearInvalid();
    setVisible(errorEl, false);

    const marketValue  = parsePositive(fields.marketValue.value);
    const assessRate   = parsePositive(fields.assessRate.value);
    const millRate     = parsePositive(fields.millRate.value);
    const exemption    = parsePositive(fields.exemption.value || "0");

    let valid = true;

    if (isNaN(marketValue) || marketValue === 0) {
      fields.marketValue.classList.add("invalid");
      valid = false;
    }
    if (isNaN(assessRate) || assessRate === 0 || assessRate > 100) {
      fields.assessRate.classList.add("invalid");
      valid = false;
    }
    if (isNaN(millRate)) {
      fields.millRate.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      errorEl.textContent = "Please correct the highlighted fields before calculating.";
      setVisible(errorEl, true);
      return;
    }

    const assessedValue  = marketValue * (assessRate / 100);
    const taxableValue   = Math.max(0, assessedValue - exemption);
    const annualTax      = taxableValue * (millRate / 1000);
    const monthlyTax     = annualTax / 12;
    const effectiveRate  = marketValue > 0 ? (annualTax / marketValue) * 100 : 0;

    outputs.assessedValue.textContent = formatCurrency(assessedValue);
    outputs.taxableValue.textContent  = formatCurrency(taxableValue);
    outputs.annualTax.textContent     = formatCurrency(annualTax);
    outputs.monthlyTax.textContent    = formatCurrency(monthlyTax);
    outputs.effectiveRate.textContent = formatPercent(effectiveRate);

    setVisible(resultsEl, true);
  }
})();

// ── Panel 2: Property Tax Back-Solver ────────────────────────────────────────

(function initTaxSolver() {
  const form = document.getElementById("tax-form");
  const resultsEl = document.getElementById("tax-results");
  const errorEl = document.getElementById("tax-error");

  const fields = {
    assessedValue: document.getElementById("tax-assessed"),
    targetTax:     document.getElementById("tax-target"),
  };

  const outputs = {
    millRate:      document.getElementById("tax-out-mill"),
    effectiveRate: document.getElementById("tax-out-effective"),
    monthly:       document.getElementById("tax-out-monthly"),
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const assessedValue = parsePositive(fields.assessedValue.value);
    const targetTax     = parsePositive(fields.targetTax.value);

    let valid = true;
    fields.assessedValue.classList.remove("invalid");
    fields.targetTax.classList.remove("invalid");
    setVisible(errorEl, false);

    if (isNaN(assessedValue) || assessedValue === 0) {
      fields.assessedValue.classList.add("invalid");
      valid = false;
    }
    if (isNaN(targetTax)) {
      fields.targetTax.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      errorEl.textContent = "Please correct the highlighted fields before calculating.";
      setVisible(errorEl, true);
      return;
    }

    const millRate      = (targetTax / assessedValue) * 1000;
    const effectiveRate = (targetTax / assessedValue) * 100;
    const monthly       = targetTax / 12;

    outputs.millRate.textContent      = millRate.toFixed(4);
    outputs.effectiveRate.textContent = formatPercent(effectiveRate);
    outputs.monthly.textContent       = formatCurrency(monthly);

    setVisible(resultsEl, true);
  });

  document.getElementById("tax-reset").addEventListener("click", () => {
    form.reset();
    setVisible(resultsEl, false);
    setVisible(errorEl, false);
    fields.assessedValue.classList.remove("invalid");
    fields.targetTax.classList.remove("invalid");
  });
})();

// ── Panel 3: Mortgage Estimator ───────────────────────────────────────────────

(function initMortgage() {
  const form = document.getElementById("mtg-form");
  const resultsEl = document.getElementById("mtg-results");
  const errorEl = document.getElementById("mtg-error");

  const fields = {
    homePrice:    document.getElementById("mtg-price"),
    downPayment:  document.getElementById("mtg-down"),
    interestRate: document.getElementById("mtg-rate"),
    loanTerm:     document.getElementById("mtg-term"),
    annualTax:    document.getElementById("mtg-tax"),
    insurance:    document.getElementById("mtg-insurance"),
  };

  const outputs = {
    loanAmount:   document.getElementById("mtg-out-loan"),
    principal:    document.getElementById("mtg-out-principal"),
    taxes:        document.getElementById("mtg-out-taxes"),
    insurance:    document.getElementById("mtg-out-insurance"),
    total:        document.getElementById("mtg-out-total"),
    totalPaid:    document.getElementById("mtg-out-total-paid"),
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const homePrice    = parsePositive(fields.homePrice.value);
    const downPct      = parsePositive(fields.downPayment.value);
    const annualRate   = parsePositive(fields.interestRate.value);
    const termYears    = parsePositive(fields.loanTerm.value);
    const annualTax    = parsePositive(fields.annualTax.value  || "0");
    const annualIns    = parsePositive(fields.insurance.value  || "0");

    let valid = true;
    Object.values(fields).forEach((f) => f.classList.remove("invalid"));
    setVisible(errorEl, false);

    if (isNaN(homePrice) || homePrice === 0) { fields.homePrice.classList.add("invalid"); valid = false; }
    if (isNaN(downPct) || downPct > 100)     { fields.downPayment.classList.add("invalid"); valid = false; }
    if (isNaN(annualRate))                   { fields.interestRate.classList.add("invalid"); valid = false; }
    if (isNaN(termYears) || termYears === 0) { fields.loanTerm.classList.add("invalid"); valid = false; }

    if (!valid) {
      errorEl.textContent = "Please correct the highlighted fields before calculating.";
      setVisible(errorEl, true);
      return;
    }

    const downAmount   = homePrice * (downPct / 100);
    const loanAmount   = homePrice - downAmount;
    const monthlyRate  = annualRate / 100 / 12;
    const numPayments  = termYears * 12;

    let monthlyPrincipal;
    if (monthlyRate === 0) {
      monthlyPrincipal = loanAmount / numPayments;
    } else {
      monthlyPrincipal =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const monthlyTax = annualTax / 12;
    const monthlyIns = annualIns / 12;
    const total      = monthlyPrincipal + monthlyTax + monthlyIns;
    const totalPaid  = monthlyPrincipal * numPayments + annualTax * termYears + annualIns * termYears;

    outputs.loanAmount.textContent  = formatCurrency(loanAmount);
    outputs.principal.textContent   = formatCurrency(monthlyPrincipal);
    outputs.taxes.textContent       = formatCurrency(monthlyTax);
    outputs.insurance.textContent   = formatCurrency(monthlyIns);
    outputs.total.textContent       = formatCurrency(total);
    outputs.totalPaid.textContent   = formatCurrency(totalPaid);

    setVisible(resultsEl, true);
  });

  document.getElementById("mtg-reset").addEventListener("click", () => {
    form.reset();
    setVisible(resultsEl, false);
    setVisible(errorEl, false);
    Object.values(fields).forEach((f) => f.classList.remove("invalid"));
  });
})();
