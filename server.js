const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const RUSSIAN_MONTHS = {
  'январь': 0, 'января': 0, 'февраль': 1, 'февраля': 1,
  'март': 2, 'марта': 2, 'апрель': 3, 'апреля': 3,
  'май': 4, 'мая': 4, 'июнь': 5, 'июня': 5,
  'июль': 6, 'июля': 6, 'август': 7, 'августа': 7,
  'сентябрь': 8, 'сентября': 8, 'октябрь': 9, 'октября': 9,
  'ноябрь': 10, 'ноября': 10, 'декабрь': 11, 'декабря': 11
};

function parseRussianDate(str) {
  if (!str) return null;
  const parts = str.trim().toLowerCase().split(/[\.\s]+/);
  if (parts.length < 2) return null;
  const month = RUSSIAN_MONTHS[parts[0]];
  const year = parseInt(parts[1]);
  if (month === undefined || isNaN(year)) return null;
  return new Date(year, month, 1);
}

function calculateIRR(cashFlows) {
  let rate = 0.1;
  for (let i = 0; i < 1000; i++) {
    let npv = 0, dnpv = 0;
    cashFlows.forEach((cf, t) => {
      npv  += cf / Math.pow(1 + rate, t);
      dnpv += -t * cf / Math.pow(1 + rate, t + 1);
    });
    if (Math.abs(npv) < 0.001) break;
    if (dnpv === 0) break;
    rate = rate - npv / dnpv;
  }
  if (!isFinite(rate) || rate < -1) return null;
  return rate * 100;
}

app.post('/calculate', (req, res) => {
  const data = req.body;

  const horizon    = data.A?.horizon || 6;
  const startYear  = 2026;
  const years      = Array.from({ length: horizon }, (_, i) => startYear + i);
  const creditRate = (data.G?.creditRate || 9) / 100;

  const products      = data.E  || [];
  const directCosts   = data.C1 || [];
  const indirectCosts = data.C2 || [];
  const adminCosts    = data.D  || [];
  const personnel     = data.F  || [];
  const investments   = data.B  || [];

  // ── Revenue & Quantity ──────────────────────────────────────────
  const revenueByYear  = {};
  const quantityByYear = {};

  years.forEach(year => {
    let rev = 0, qty = 0;
    products.forEach(p => {
      const sd = parseRussianDate(p.startDate);
      if (!sd) return;
      const sy = sd.getFullYear();
      if (year < sy) return;
      const gf = Math.pow(1 + (p.growth || 0) / 100, year - sy);
      const aq = year === sy
        ? p.quantity * (12 - sd.getMonth()) * gf
        : p.quantity * 12 * gf;
      qty += aq;
      rev += aq * p.price;
    });
    revenueByYear[year]  = rev / 1000;
    quantityByYear[year] = qty;
  });

  // ── Direct costs ────────────────────────────────────────────────
  const directCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    products.forEach(p => {
      const sd = parseRussianDate(p.startDate);
      if (!sd) return;
      const sy = sd.getFullYear();
      if (year < sy) return;
      const gf = Math.pow(1 + (p.growth || 0) / 100, year - sy);
      const aq = year === sy
        ? p.quantity * (12 - sd.getMonth()) * gf
        : p.quantity * 12 * gf;
      const costPerUnit = directCosts
        .filter(c => c.product === p.product)
        .reduce((s, c) => s + (c.amountPerUnit || 0) * Math.pow(1 + (c.growth || 0) / 100, year - sy), 0);
      total += costPerUnit * aq;
    });
    directCostsByYear[year] = total / 1000;
  });

  // ── Indirect costs ──────────────────────────────────────────────
  const indirectCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    indirectCosts.forEach(c => {
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
    indirectCostsByYear[year] = total / 1000;
  });

  // ── Admin costs ─────────────────────────────────────────────────
  const adminCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    adminCosts.forEach(c => {
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
    adminCostsByYear[year] = total / 1000;
  });

  // ── Payroll + Insurance premiums (30%) ──────────────────────────
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
        total += person.salary * person.count * 12 * gf;
      }
    });
    payrollByYear[year]   = total / 1000;
    insuranceByYear[year] = (total * 0.30) / 1000;
  });

  // ── Investments ─────────────────────────────────────────────────
  const investmentsByYear = {};
  let totalInvestment = 0;
  years.forEach(year => {
    let total = 0;
    investments.forEach(inv => {
      const d = parseRussianDate(inv.date);
      if (d && d.getFullYear() === year) total += inv.amount;
    });
    investmentsByYear[year] = total / 1000;
    totalInvestment        += total / 1000;
  });

  // ── Pre-financing P&L ───────────────────────────────────────────
  const ebitda    = {};
  const netProfit = {};
  const preFin    = {};   // pre-financing cash flow
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
    preFin[year]    = netProfit[year] - inv;
    pfCumul        += preFin[year];
    preFinCum[year] = pfCumul;
  });

  // ── Financing: cover cash-flow gap ─────────────────────────────
  const minCumul       = Math.min(0, ...Object.values(preFinCum));
  const requiredLoan   = Math.abs(minCumul);                // in thousands
  const repayYears     = Math.max(1, years.length - 1);
  const annualPrincipal = requiredLoan / repayYears;        // per year, from yr 2

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

  // ── Final cash flow (with financing) ───────────────────────────
  const cashFlow     = {};
  const cashCumulative = {};
  let cumul = 0;
  years.forEach(year => {
    cashFlow[year] = netProfit[year]
      + financingByYear[year]
      - principalRepaymentByYear[year]
      - interestRepaymentByYear[year]
      - (investmentsByYear[year] || 0);
    cumul            += cashFlow[year];
    cashCumulative[year] = cumul;
  });

  // ── Investment indicators ───────────────────────────────────────
  const discountRate = 0.16;
  let npv = 0;
  const allCF = [-requiredLoan];
  years.forEach((year, idx) => {
    npv += cashFlow[year] / Math.pow(1 + discountRate, idx + 1);
    allCF.push(netProfit[year]);
  });

  const irr = calculateIRR(allCF);
  const pi  = requiredLoan > 0
    ? ((npv + requiredLoan) / requiredLoan).toFixed(2)
    : 'н/д';

  const pluralYears = n => {
    const abs = Math.abs(n) % 100;
    const n1  = abs % 10;
    if (abs > 10 && abs < 20) return 'лет';
    if (n1 === 1)             return 'год';
    if (n1 >= 2 && n1 <= 4)   return 'года';
    return 'лет';
  };

  const genitiveYears = n => (n % 10 === 1 && n % 100 !== 11) ? 'года' : 'лет';
  const piNum = (typeof pi === 'string' && pi !== 'н/д') ? parseFloat(pi) : (typeof pi === 'number' ? pi : null);
  let paybackPeriod;
  if (horizon === 1 || npv < 0 || (piNum !== null && piNum < 1)) {
    paybackPeriod = 'не рассчитывается';
  } else {
    paybackPeriod = `более ${horizon} ${genitiveYears(horizon)}`;
    for (let i = 0; i < years.length; i++) {
      if (cashCumulative[years[i]] >= 0) {
        const n = i + 1;
        paybackPeriod = `${n} ${pluralYears(n)}`;
        break;
      }
    }
  }

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
    npv:                  npv.toFixed(0),
    irr:                  (typeof irr === 'number' && isFinite(irr)) ? Number(irr.toFixed(2)) : 'н/д',
    pi,
    paybackPeriod
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
