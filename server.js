const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const RUSSIAN_MONTHS = {
  'январь': 0, 'января': 0, 'jan': 0,
  'февраль': 1, 'февраля': 1, 'feb': 1,
  'март': 2, 'марта': 2, 'mar': 2,
  'апрель': 3, 'апреля': 3, 'apr': 3,
  'май': 4, 'мая': 4, 'may': 4,
  'июнь': 5, 'июня': 5, 'jun': 5,
  'июль': 6, 'июля': 6, 'jul': 6,
  'август': 7, 'августа': 7, 'aug': 7,
  'сентябрь': 8, 'сентября': 8, 'sep': 8,
  'октябрь': 9, 'октября': 9, 'oct': 9,
  'ноябрь': 10, 'ноября': 10, 'nov': 10,
  'декабрь': 11, 'декабря': 11, 'dec': 11
};

function parseRussianDate(str) {
  if (!str) return null;
  const parts = str.trim().toLowerCase().split(/[\.\s]+/);
  if (parts.length < 2) return null;
  const monthStr = parts[0];
  const yearStr = parts[1];
  const month = RUSSIAN_MONTHS[monthStr];
  const year = parseInt(yearStr);
  if (month === undefined || isNaN(year)) return null;
  return new Date(year, month, 1);
}

function calculateIRR(cashFlows) {
  let rate = 0.1;
  for (let i = 0; i < 1000; i++) {
    let npv = 0;
    let dnpv = 0;
    cashFlows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + rate, t);
      dnpv += -t * cf / Math.pow(1 + rate, t + 1);
    });
    if (Math.abs(npv) < 0.001) break;
    if (dnpv === 0) break;
    rate = rate - npv / dnpv;
  }
  if (!isFinite(rate) || rate < -1) return null;
  return (rate * 100).toFixed(1);
}

app.post('/calculate', (req, res) => {
  const data = req.body;

  const horizon = data.A?.horizon || 6;
  const startYear = 2026;
  const years = Array.from({ length: horizon }, (_, i) => startYear + i);

  const products = data.E || [];
  const directCosts = data.C1 || [];
  const indirectCosts = data.C2 || [];
  const adminCosts = data.D || [];
  const personnel = data.F || [];
  const investments = data.B || [];

  let revenueByYear = {};
  let quantityByYear = {};

  years.forEach(year => {
    let yearRevenue = 0;
    let yearQuantity = 0;

    products.forEach(product => {
      const startDate = parseRussianDate(product.startDate);
      if (!startDate) return;
      const productStartYear = startDate.getFullYear();
      if (year < productStartYear) return;

      const growthFactor = Math.pow(1 + (product.growth || 0) / 100, year - productStartYear);
      let annualQty;
      if (year === productStartYear) {
        const startMonth = startDate.getMonth();
        const monthsInYear = 12 - startMonth;
        annualQty = product.quantity * monthsInYear * growthFactor;
      } else {
        annualQty = product.quantity * 12 * growthFactor;
      }
      yearQuantity += annualQty;
      yearRevenue += annualQty * product.price;
    });

    revenueByYear[year] = yearRevenue / 1000;
    quantityByYear[year] = yearQuantity;
  });

  let directCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    products.forEach(product => {
      const startDate = parseRussianDate(product.startDate);
      if (!startDate) return;
      const productStartYear = startDate.getFullYear();
      if (year < productStartYear) return;

      const productDirectCosts = directCosts.filter(c => c.product === product.product);
      const growthFactor = Math.pow(1 + (product.growth || 0) / 100, year - productStartYear);
      let annualQty;
      if (year === productStartYear) {
        const startMonth = startDate.getMonth();
        const monthsInYear = 12 - startMonth;
        annualQty = product.quantity * monthsInYear * growthFactor;
      } else {
        annualQty = product.quantity * 12 * growthFactor;
      }
      const costPerUnit = productDirectCosts.reduce((sum, c) => {
        const costGrowth = Math.pow(1 + (c.growth || 0) / 100, year - productStartYear);
        return sum + (c.amountPerUnit || 0) * costGrowth;
      }, 0);
      total += costPerUnit * annualQty;
    });
    directCostsByYear[year] = total / 1000;
  });

  let indirectCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    indirectCosts.forEach(cost => {
      const costStartDate = parseRussianDate(cost.startDate);
      const costStartYear = costStartDate ? costStartDate.getFullYear() : startYear;
      if (year < costStartYear) return;

      let annualAmount = cost.amount;
      if (cost.periodicity === 'ежемесячно') annualAmount *= 12;
      else if (cost.periodicity === 'ежеквартально') annualAmount *= 4;

      const growthFactor = Math.pow(1 + (cost.growth || 0) / 100, year - costStartYear);
      total += annualAmount * growthFactor;
    });
    indirectCostsByYear[year] = total / 1000;
  });

  let adminCostsByYear = {};
  years.forEach(year => {
    let total = 0;
    adminCosts.forEach(cost => {
      const costStartDate = parseRussianDate(cost.startDate);
      const costStartYear = costStartDate ? costStartDate.getFullYear() : startYear;
      if (year < costStartYear) return;

      let annualAmount = cost.amount;
      if (cost.periodicity === 'ежемесячно') annualAmount *= 12;
      else if (cost.periodicity === 'ежеквартально') annualAmount *= 4;

      const growthFactor = Math.pow(1 + (cost.growth || 0) / 100, year - costStartYear);
      total += annualAmount * growthFactor;
    });
    adminCostsByYear[year] = total / 1000;
  });

  let payrollByYear = {};
  years.forEach(year => {
    let total = 0;
    personnel.forEach(person => {
      const hireDate = parseRussianDate(person.hireDate);
      if (!hireDate) return;
      const hireYear = hireDate.getFullYear();
      if (year >= hireYear && person.count > 0) {
        const growthFactor = Math.pow(1 + (person.growth || 0) / 100, year - hireYear);
        total += person.salary * person.count * 12 * growthFactor;
      }
    });
    payrollByYear[year] = total / 1000;
  });

  let investmentsByYear = {};
  let totalInvestment = 0;
  years.forEach(year => {
    let total = 0;
    investments.forEach(inv => {
      const invDate = parseRussianDate(inv.date);
      if (invDate && invDate.getFullYear() === year) {
        total += inv.amount;
      }
    });
    investmentsByYear[year] = total / 1000;
    totalInvestment += total / 1000;
  });

  const ebitda = {};
  const netProfit = {};
  let cashCumulative = {};
  let cashFlow = {};
  let cumulative = 0;

  years.forEach(year => {
    const revenue = revenueByYear[year] || 0;
    const direct = directCostsByYear[year] || 0;
    const indirect = indirectCostsByYear[year] || 0;
    const admin = adminCostsByYear[year] || 0;
    const payroll = payrollByYear[year] || 0;
    const inv = investmentsByYear[year] || 0;

    ebitda[year] = revenue - direct - indirect - admin - payroll;
    netProfit[year] = ebitda[year] * 0.8;
    cashFlow[year] = netProfit[year] - inv;
    cumulative += cashFlow[year];
    cashCumulative[year] = cumulative;
  });

  const discountRate = 0.16;
  let npv = 0;
  const allCashFlows = [-(totalInvestment)];
  years.forEach((year, idx) => {
    npv += cashFlow[year] / Math.pow(1 + discountRate, idx + 1);
    allCashFlows.push(netProfit[year]);
  });

  const irr = calculateIRR(allCashFlows);

  const pi = totalInvestment > 0
    ? ((npv + totalInvestment) / totalInvestment).toFixed(2)
    : 'н/д';

  let paybackPeriod = `>${horizon} лет`;
  for (let i = 0; i < years.length; i++) {
    if (cashCumulative[years[i]] >= 0) {
      paybackPeriod = `${i + 1} лет`;
      break;
    }
  }

  res.json({
    years,
    revenue: years.map(y => revenueByYear[y]),
    quantity: years.map(y => quantityByYear[y]),
    directCosts: years.map(y => directCostsByYear[y]),
    indirectCosts: years.map(y => indirectCostsByYear[y]),
    adminCosts: years.map(y => adminCostsByYear[y]),
    payroll: years.map(y => payrollByYear[y]),
    investments: years.map(y => investmentsByYear[y]),
    ebitda: years.map(y => ebitda[y]),
    netProfit: years.map(y => netProfit[y]),
    cashCumulative: years.map(y => cashCumulative[y]),
    npv: npv.toFixed(0),
    irr: irr !== null ? irr : 'н/д',
    pi,
    paybackPeriod
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
