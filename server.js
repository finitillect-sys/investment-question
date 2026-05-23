const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Constants ──────────────────────────────────────────────────────────────────
// RUSSIAN_MONTHS mirrors RUSSIAN_MONTHS_MAP in public/script.js — keep in sync.
const RUSSIAN_MONTHS = {
  'январь': 0, 'января': 0, 'февраль': 1, 'февраля': 1,
  'март': 2, 'марта': 2, 'апрель': 3, 'апреля': 3,
  'май': 4, 'мая': 4, 'июнь': 5, 'июня': 5,
  'июль': 6, 'июля': 6, 'август': 7, 'августа': 7,
  'сентябрь': 8, 'сентября': 8, 'октябрь': 9, 'октября': 9,
  'ноябрь': 10, 'ноября': 10, 'декабрь': 11, 'декабря': 11
};

// ── Date helpers ───────────────────────────────────────────────────────────────
function parseRussianDate(str) {
  if (!str) return null;
  const parts = str.trim().toLowerCase().split(/[\.\s]+/);
  if (parts.length < 2) return null;
  const month = RUSSIAN_MONTHS[parts[0]];
  const year = parseInt(parts[1]);
  if (month === undefined || isNaN(year)) return null;
  return new Date(year, month, 1);
}

// ── Seasonality helpers ────────────────────────────────────────────────────────
// Russian seasons: winter=Dec,Jan,Feb | spring=Mar,Apr,May | summer=Jun,Jul,Aug | autumn=Sep,Oct,Nov
function seasonKeyForMonth(m) {
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4)             return 'spring';
  if (m <= 7)             return 'summer';
  return 'autumn';
}

function seasonCoef(product, m) {
  const raw = product[seasonKeyForMonth(m)];
  if (raw === undefined || raw === null || raw === '' || isNaN(raw)) return 1;
  return Number(raw) / 100;
}

function productMonthsFactor(product, year, startMonth) {
  let sum = 0;
  for (let m = startMonth; m < 12; m++) sum += seasonCoef(product, m);
  return sum;
}

// ── Locale helpers ─────────────────────────────────────────────────────────────
function pluralYears(n) {
  const abs = Math.abs(n) % 100;
  const n1  = abs % 10;
  if (abs > 10 && abs < 20) return 'лет';
  if (n1 === 1)             return 'год';
  if (n1 >= 2 && n1 <= 4)   return 'года';
  return 'лет';
}

function genitiveYears(n) {
  return (n % 10 === 1 && n % 100 !== 11) ? 'года' : 'лет';
}

// ── IRR (bisection, bounded to -99%..+1000%) ───────────────────────────────────
function calculateIRR(cashFlows) {
  const hasNeg = cashFlows.some(cf => cf < 0);
  const hasPos = cashFlows.some(cf => cf > 0);
  if (!hasNeg || !hasPos) return null;

  const npvAt = r => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);

  let lo = -0.99, hi = 10;
  let fLo = npvAt(lo), fHi = npvAt(hi);
  if (!isFinite(fLo) || !isFinite(fHi) || fLo * fHi > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid  = (lo + hi) / 2;
    const fMid = npvAt(mid);
    if (!isFinite(fMid)) return null;
    if (Math.abs(fMid) < 1e-6 || (hi - lo) < 1e-7) return mid * 100;
    if (fLo * fMid < 0) { hi = mid; fHi = fMid; }
    else                { lo = mid; fLo = fMid; }
  }
  const rate = (lo + hi) / 2;
  if (!isFinite(rate) || rate < -0.99 || rate > 10) return null;
  return rate * 100;
}

// ── Financial computation functions ───────────────────────────────────────────

function computeRevenueAndQuantity(products, years) {
  const revenueByYear  = {};
  const quantityByYear = {};
  years.forEach(year => {
    let rev = 0, qty = 0;
    products.forEach(p => {
      const sd = parseRussianDate(p.startDate);
      if (!sd) return;
      const sy = sd.getFullYear();
      if (year < sy) return;
      const gf         = Math.pow(1 + (p.growth || 0) / 100, year - sy);
      const startMonth = year === sy ? sd.getMonth() : 0;
      const aq         = p.quantity * productMonthsFactor(p, year, startMonth) * gf;
      qty += aq;
      rev += aq * p.price;
    });
    revenueByYear[year]  = rev / 1000;
    quantityByYear[year] = qty;
  });
  return { revenueByYear, quantityByYear };
}

function computeDirectCosts(products, directCosts, years) {
  const directCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    products.forEach(p => {
      const sd = parseRussianDate(p.startDate);
      if (!sd) return;
      const sy = sd.getFullYear();
      if (year < sy) return;
      const gf         = Math.pow(1 + (p.growth || 0) / 100, year - sy);
      const startMonth = year === sy ? sd.getMonth() : 0;
      const aq         = p.quantity * productMonthsFactor(p, year, startMonth) * gf;
      const costPerUnit = directCosts
        .filter(c => c.product === p.product)
        .reduce((s, c) => s + (c.amountPerUnit || 0) * Math.pow(1 + (c.growth || 0) / 100, year - sy), 0);
      total += costPerUnit * aq;
    });
    directCostsByYear[year] = total / 1000;
  });
  return directCostsByYear;
}

// Shared logic for C2 (indirect) and D (admin) — identical periodicity model.
function computePeriodCosts(items, years, startYear) {
  const byYear = {};
  years.forEach(year => {
    let total = 0;
    items.forEach(c => {
      const sd  = parseRussianDate(c.startDate);
      const csy = sd ? sd.getFullYear() : startYear;
      if (year < csy) return;
      if (c.periodicity === 'единовременно') {
        if (year === csy) total += c.amount;
        return;
      }
      let amt = c.amount;
      if (c.periodicity === 'ежемесячно')         amt *= 12;
      else if (c.periodicity === 'ежеквартально') amt *= 4;
      total += amt * Math.pow(1 + (c.growth || 0) / 100, year - csy);
    });
    byYear[year] = total / 1000;
  });
  return byYear;
}

function computePayroll(personnel, years) {
  const payrollByYear   = {};
  const insuranceByYear = {};
  years.forEach(year => {
    let total = 0;
    personnel.forEach(person => {
      const hd = parseRussianDate(person.hireDate);
      if (!hd) return;
      const hy = hd.getFullYear();
      if (year >= hy && person.count > 0) {
        const gf = Math.pow(1 + (person.growth || 0) / 100, year - hy);
        let monthsPerYear = 12;
        if (person.type === 'сезонный') {
          const m = parseInt(person.monthsPerYear, 10);
          monthsPerYear = (isNaN(m) || m < 1) ? 12 : Math.min(12, m);
        }
        total += person.salary * person.count * monthsPerYear * gf;
      }
    });
    payrollByYear[year]   = total / 1000;
    insuranceByYear[year] = (total * 0.30) / 1000;
  });
  return { payrollByYear, insuranceByYear };
}

function computeInvestments(investments, years) {
  const investmentsByYear = {};
  years.forEach(year => {
    let total = 0;
    investments.forEach(inv => {
      const d = parseRussianDate(inv.date);
      if (d && d.getFullYear() === year) total += inv.amount;
    });
    investmentsByYear[year] = total / 1000;
  });
  return investmentsByYear;
}

function computePnL(revenueByYear, directCostsByYear, indirectCostsByYear,
                    adminCostsByYear, payrollByYear, insuranceByYear,
                    investmentsByYear, years) {
  const ebitda    = {};
  const netProfit = {};
  const preFinCum = {};
  let pfCumul = 0;

  years.forEach(year => {
    const rev      = revenueByYear[year]       || 0;
    const direct   = directCostsByYear[year]   || 0;
    const indirect = indirectCostsByYear[year] || 0;
    const admin    = adminCostsByYear[year]     || 0;
    const payroll  = payrollByYear[year]        || 0;
    const ins      = insuranceByYear[year]      || 0;
    const inv      = investmentsByYear[year]    || 0;

    ebitda[year]    = rev - direct - indirect - admin - payroll - ins;
    netProfit[year] = ebitda[year] * 0.8;
    const preFin    = netProfit[year] - inv;
    pfCumul        += preFin;
    preFinCum[year] = pfCumul;
  });

  return { ebitda, netProfit, preFinCum };
}

function computeFinancing(preFinCum, years, creditRate) {
  const minCumul        = Math.min(0, ...Object.values(preFinCum));
  const requiredLoan    = Math.abs(minCumul);
  const repayYears      = Math.max(1, years.length - 1);
  const annualPrincipal = requiredLoan / repayYears;

  const financingByYear          = {};
  const principalRepaymentByYear = {};
  const interestRepaymentByYear  = {};
  let outstanding = requiredLoan;

  years.forEach((year, idx) => {
    if (idx === 0) {
      financingByYear[year]          = requiredLoan;
      principalRepaymentByYear[year] = 0;
      interestRepaymentByYear[year]  = 0;
    } else {
      financingByYear[year]          = 0;
      interestRepaymentByYear[year]  = outstanding * creditRate;
      principalRepaymentByYear[year] = annualPrincipal;
      outstanding = Math.max(0, outstanding - annualPrincipal);
    }
  });

  return { requiredLoan, financingByYear, principalRepaymentByYear, interestRepaymentByYear };
}

function computeFinalCashFlow(netProfit, financingByYear, principalRepaymentByYear,
                               interestRepaymentByYear, investmentsByYear, years) {
  const cashFlow       = {};
  const cashCumulative = {};
  let cumul = 0;

  years.forEach(year => {
    cashFlow[year] = netProfit[year]
      + financingByYear[year]
      - principalRepaymentByYear[year]
      - interestRepaymentByYear[year]
      - (investmentsByYear[year] || 0);
    cumul               += cashFlow[year];
    cashCumulative[year] = cumul;
  });

  return { cashFlow, cashCumulative };
}

function computeIndicators(cashFlow, netProfit, requiredLoan, preFinCum, years, horizon) {
  const discountRate = 0.16;
  let npv = 0;
  const allCF = [-requiredLoan];

  years.forEach((year, idx) => {
    npv += cashFlow[year] / Math.pow(1 + discountRate, idx + 1);
    allCF.push(netProfit[year]);
  });

  const irr = calculateIRR(allCF);
  // pi returned as number (2 dp) or null — client formats display
  const pi  = requiredLoan > 0 ? Number(((npv + requiredLoan) / requiredLoan).toFixed(2)) : null;

  let paybackPeriod;
  if (horizon === 1 || npv < 0 || pi === null || pi < 1) {
    paybackPeriod = 'н/д';
  } else {
    paybackPeriod = `более ${horizon} ${genitiveYears(horizon)}`;
    for (let i = 0; i < years.length; i++) {
      if (preFinCum[years[i]] >= 0) {
        const n = i + 1;
        paybackPeriod = `${n} ${pluralYears(n)}`;
        break;
      }
    }
  }

  return {
    npv: npv.toFixed(0),
    irr: (typeof irr === 'number' && isFinite(irr)) ? Number(irr.toFixed(2)) : 'н/д',
    pi,
    paybackPeriod
  };
}

// ── Route ──────────────────────────────────────────────────────────────────────
app.post('/calculate', (req, res) => {
  try {
    const data = req.body;

    const horizon     = data.A?.horizon || 6;
    const parsedStart = parseRussianDate(data.A?.startDate);
    const startYear   = parsedStart ? parsedStart.getFullYear() : new Date().getFullYear();
    const years       = Array.from({ length: horizon }, (_, i) => startYear + i);
    const creditRate  = (data.G?.creditRate || 9) / 100;

    const products      = data.E  || [];
    const directCosts   = data.C1 || [];
    const indirectCosts = data.C2 || [];
    const adminCosts    = data.D  || [];
    const personnel     = data.F  || [];
    const investments   = data.B  || [];

    const { revenueByYear, quantityByYear }    = computeRevenueAndQuantity(products, years);
    const directCostsByYear                    = computeDirectCosts(products, directCosts, years);
    const indirectCostsByYear                  = computePeriodCosts(indirectCosts, years, startYear);
    const adminCostsByYear                     = computePeriodCosts(adminCosts, years, startYear);
    const { payrollByYear, insuranceByYear }   = computePayroll(personnel, years);
    const investmentsByYear                    = computeInvestments(investments, years);
    const { ebitda, netProfit, preFinCum }     = computePnL(
      revenueByYear, directCostsByYear, indirectCostsByYear,
      adminCostsByYear, payrollByYear, insuranceByYear, investmentsByYear, years
    );
    const { requiredLoan, financingByYear, principalRepaymentByYear, interestRepaymentByYear } =
      computeFinancing(preFinCum, years, creditRate);
    const { cashFlow, cashCumulative }         = computeFinalCashFlow(
      netProfit, financingByYear, principalRepaymentByYear,
      interestRepaymentByYear, investmentsByYear, years
    );
    const { npv, irr, pi, paybackPeriod }      = computeIndicators(
      cashFlow, netProfit, requiredLoan, preFinCum, years, horizon
    );

    res.json({
      years,
      revenue:              years.map(y => revenueByYear[y]),
      quantity:             years.map(y => quantityByYear[y]),
      directCosts:          years.map(y => directCostsByYear[y]),
      indirectCosts:        years.map(y => indirectCostsByYear[y]),
      adminCosts:           years.map(y => adminCostsByYear[y]),
      payroll:              years.map(y => payrollByYear[y]),
      insurancePremiums:    years.map(y => insuranceByYear[y]),
      investments:          years.map(y => investmentsByYear[y]),
      ebitda:               years.map(y => ebitda[y]),
      netProfit:            years.map(y => netProfit[y]),
      financing:            years.map(y => financingByYear[y]),
      principalRepayment:   years.map(y => principalRepaymentByYear[y]),
      interestRepayment:    years.map(y => interestRepaymentByYear[y]),
      cashFlow:             years.map(y => cashFlow[y]),
      cashCumulative:       years.map(y => cashCumulative[y]),
      requiredLoan:         requiredLoan.toFixed(0),
      npv,
      irr,
      pi,
      paybackPeriod
    });
  } catch (err) {
    console.error('Calculation error:', err);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
