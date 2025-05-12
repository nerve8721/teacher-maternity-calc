import React, { useState } from 'react';

// Design tokens - Tailwind v4 compatible
const colors = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  secondary: '#f43f5e',
  neutral100: '#f3f4f6',
  neutral200: '#e5e7eb',
  neutral700: '#374151',
  neutral800: '#1f2937',
  success: '#22c55e',
};

// Helper functions for date manipulation
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const addWeeks = (date, weeks) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + weeks * 7);
  return newDate;
};

const isWithinInterval = (date, start, end) => {
  const checkDate = new Date(date);
  const startDate = new Date(start);
  const endDate = new Date(end);
  return checkDate >= startDate && checkDate <= endDate;
};

// Generate all Mondays between start and end dates
const getMondays = (startDateStr, endDateStr) => {
  const mondays = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Adjust to the next Monday if not already a Monday
  const firstDay = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilMonday = firstDay === 1 ? 0 : (firstDay === 0 ? 1 : 8 - firstDay);
  
  let current = new Date(start);
  if (daysUntilMonday > 0) {
    current.setDate(current.getDate() + daysUntilMonday);
  }
  
  // Generate all Mondays
  while (current <= end) {
    mondays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return mondays;
};

// Component: Input wrapper
const Input = ({ label, id, type = 'text', value, onChange, required = false, min, max, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
      {label} {required && <span className="text-secondary">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

// Component: Card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

// Component: CardHeader
const CardHeader = ({ children }) => (
  <div className="bg-primary p-4 text-white font-semibold">{children}</div>
);

// Component: CardContent
const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

// Component: Button
const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  
  const variantClasses = {
    primary: "bg-primary hover:bg-primaryDark text-white",
    secondary: "bg-secondary hover:bg-opacity-90 text-white",
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Component: Table
const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-neutral-200">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-neutral-100">
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="divide-y divide-neutral-200">
    {children}
  </tbody>
);

const TableRow = ({ children }) => (
  <tr>{children}</tr>
);

const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-neutral-800 ${className}`}>
    {children}
  </td>
);

// Component: Select
const Select = ({ label, id, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
      {label} {required && <span className="text-secondary">*</span>}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Main App Component
const App = () => {
  // Form state
  const [annualSalary, setAnnualSalary] = useState('');
  const [maternityStartDate, setMaternityStartDate] = useState('');
  const [dueDateBaby, setDueDateBaby] = useState('');
  const [plannedReturnDate, setPlannedReturnDate] = useState('');
  
  // Term break dates
  const [easterBreakStart, setEasterBreakStart] = useState('');
  const [easterBreakEnd, setEasterBreakEnd] = useState('');
  const [mayHalfTermStart, setMayHalfTermStart] = useState('');
  const [mayHalfTermEnd, setMayHalfTermEnd] = useState('');
  const [summerBreakStart, setSummerBreakStart] = useState('');
  const [summerBreakEnd, setSummerBreakEnd] = useState('');

  // Eligibility and pay scheme
  const [eligibility, setEligibility] = useState('');
  const [payScheme, setPayScheme] = useState('');
  
  // Results state
  const [showResults, setShowResults] = useState(false);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [normalMaternityPay, setNormalMaternityPay] = useState(0);
  const [optimizedSplPay, setOptimizedSplPay] = useState(0);
  const [extraGain, setExtraGain] = useState(0);
  const [phaseBreakdown, setPhaseBreakdown] = useState([]);

  // Calculate weekly statutory maternity pay (SMP)
  const calculateWeeklySMP = (weekNumber) => {
    // Current SMP rates - this would need updating yearly
    const weeklyAmount = weekNumber <= 6 ? Number(annualSalary) / 52 * 0.9 : 184.03;
    return Math.min(weeklyAmount, Number(annualSalary) / 52 * 0.9);
  };

  // Calculate weekly pay based on scheme and week number
  const calculateWeeklyPay = (weekNumber) => {
    const weeklyBaseSalary = Number(annualSalary) / 52;
    
    // Apply different pay schemes
    switch (payScheme) {
      case '4_2_12':
        // 4 weeks at 100%, 2 weeks at 90%, 12 weeks at 50% + SMP
        if (weekNumber <= 4) {
          return weeklyBaseSalary;
        } else if (weekNumber <= 6) {
          return weeklyBaseSalary * 0.9;
        } else if (weekNumber <= 18) {
          return (weeklyBaseSalary * 0.5) + calculateWeeklySMP(weekNumber);
        } else if (weekNumber <= 39) {
          return calculateWeeklySMP(weekNumber);
        }
        return 0;

      case '13_weeks_100':
        // 13 weeks 100%
        if (weekNumber <= 13) {
          return weeklyBaseSalary;
        } else if (weekNumber <= 39) {
          return calculateWeeklySMP(weekNumber);
        }
        return 0;

      case '6_12':
        // 6 weeks 100%, 12 weeks at 50% + SMP
        if (weekNumber <= 6) {
          return weeklyBaseSalary;
        } else if (weekNumber <= 18) {
          return (weeklyBaseSalary * 0.5) + calculateWeeklySMP(weekNumber);
        } else if (weekNumber <= 39) {
          return calculateWeeklySMP(weekNumber);
        }
        return 0;

      case 'statutory':
        // Statutory only (90% for 6 weeks then SMP)
        return calculateWeeklySMP(weekNumber);

      case '26_weeks_full':
        // 26 weeks full pay
        if (weekNumber <= 26) {
          return weeklyBaseSalary;
        } else if (weekNumber <= 39) {
          return calculateWeeklySMP(weekNumber);
        }
        return 0;

      case '18_8':
        // 18 weeks full pay, 8 weeks 50% pay
        if (weekNumber <= 18) {
          return weeklyBaseSalary;
        } else if (weekNumber <= 26) {
          return weeklyBaseSalary * 0.5;
        } else if (weekNumber <= 39) {
          return calculateWeeklySMP(weekNumber);
        }
        return 0;

      default:
        return calculateWeeklySMP(weekNumber);
    }
  };

  // Check if a date falls within any school break period
  const isInSchoolBreak = (date) => {
    const dateObj = new Date(date);
    
    // Check Easter break
    if (easterBreakStart && easterBreakEnd && 
        isWithinInterval(dateObj, easterBreakStart, easterBreakEnd)) {
      return 'Easter Break';
    }
    
    // Check May half-term
    if (mayHalfTermStart && mayHalfTermEnd && 
        isWithinInterval(dateObj, mayHalfTermStart, mayHalfTermEnd)) {
      return 'May Half-Term';
    }
    
    // Check Summer break
    if (summerBreakStart && summerBreakEnd && 
        isWithinInterval(dateObj, summerBreakStart, summerBreakEnd)) {
      return 'Summer Break';
    }
    
    return false;
  };

  // Get pay type description based on week number
  const getPayType = (weekNumber) => {
    switch (payScheme) {
      case '4_2_12':
        if (weekNumber <= 4) return '100% Pay';
        if (weekNumber <= 6) return '90% Pay';
        if (weekNumber <= 18) return '50% Pay + SMP';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      case '13_weeks_100':
        if (weekNumber <= 13) return '100% Pay';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      case '6_12':
        if (weekNumber <= 6) return '100% Pay';
        if (weekNumber <= 18) return '50% Pay + SMP';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      case 'statutory':
        if (weekNumber <= 6) return '90% Pay';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      case '26_weeks_full':
        if (weekNumber <= 26) return '100% Pay';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      case '18_8':
        if (weekNumber <= 18) return '100% Pay';
        if (weekNumber <= 26) return '50% Pay';
        if (weekNumber <= 39) return 'SMP Only';
        return 'Unpaid';
        
      default:
        if (weekNumber <= 39) return 'SMP';
        return 'Unpaid';
    }
  };

  // Calculate the maternity and SPL breakdown
  const calculateBreakdown = () => {
    if (!maternityStartDate || !annualSalary || !eligibility || !payScheme) {
      alert('Please fill in required fields');
      return;
    }

    const startDate = new Date(maternityStartDate);
    const endDate = plannedReturnDate 
      ? new Date(plannedReturnDate) 
      : addWeeks(startDate, 52);
    
    // Generate all Mondays in the maternity period
    const weeksInPeriod = getMondays(startDate, endDate);
    
    let normalTotal = 0;
    let optimizedTotal = 0;
    let weeklyData = [];
    let phaseData = [];
    let currentPhase = { type: '', start: 0, end: 0, amount: 0 };
    
    weeksInPeriod.forEach((weekStart, index) => {
      const weekNumber = index + 1;
      const weeklyPay = calculateWeeklyPay(weekNumber);
      const formattedDate = formatDate(weekStart);
      const breakType = isInSchoolBreak(weekStart);
      
      // Phase tracking for breakdown
      const payType = getPayType(weekNumber);
      if (currentPhase.type !== payType) {
        if (currentPhase.type) {
          phaseData.push({
            ...currentPhase,
            end: weekNumber - 1
          });
        }
        currentPhase = { 
          type: payType, 
          start: weekNumber, 
          end: 0, 
          amount: weeklyPay 
        };
      }
      
      // Normal maternity case - always count full pay
      normalTotal += weeklyPay;
      
      // Optimized SPL case - return to work during breaks if eligible
      const optimizedPay = breakType && eligibility !== 'not_eligible' 
        ? Number(annualSalary) / 52  // Full salary during breaks
        : weeklyPay;  // Regular maternity pay otherwise
        
      optimizedTotal += optimizedPay;
      
      weeklyData.push({
        date: formattedDate,
        weekNumber,
        weeklyPay: weeklyPay.toFixed(2),
        optimizedPay: optimizedPay.toFixed(2),
        status: breakType || 'Maternity Leave',
        payType
      });
    });
    
    // Add the final phase
    if (currentPhase.type) {
      phaseData.push({
        ...currentPhase,
        end: weeksInPeriod.length
      });
    }
    
    // Set state with calculated values
    setWeeklyBreakdown(weeklyData);
    setNormalMaternityPay(normalTotal);
    setOptimizedSplPay(optimizedTotal);
    setExtraGain(optimizedTotal - normalTotal);
    setPhaseBreakdown(phaseData);
    setShowResults(true);
  };

  // Eligibility options
  const eligibilityOptions = [
    { value: 'both_eligible', label: 'Both parents eligible' },
    { value: 'partner_not_eligible', label: 'Partner not eligible to take leave but meets requirements for me to' },
    { value: 'not_eligible', label: 'Not eligible' }
  ];

  // Pay scheme options
  const paySchemeOptions = [
    { value: '4_2_12', label: '4 weeks at 100%, 2 weeks at 90% plus 12 weeks at 50% + SMP' },
    { value: '13_weeks_100', label: '13 weeks 100%' },
    { value: '6_12', label: '6 weeks 100%, 12 weeks at 50% + SMP' },
    { value: 'statutory', label: 'Statutory only (90% for 6 weeks then SMP)' },
    { value: '26_weeks_full', label: '26 weeks full pay' },
    { value: '18_8', label: '18 weeks full pay, 8 weeks 50% pay' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Teacher Maternity & SPL Pay Calculator</h1>
      
      <Card className="mb-8">
        <CardHeader>Personal Details</CardHeader>
        <CardContent>
          <Input
            label="What is your annual salary (£) inclusive of any TLRs etc"
            id="annualSalary"
            type="number"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(e.target.value)}
            required
            placeholder="e.g. 38000"
          />
          
          <Input
            label="What date is your baby due?"
            id="dueDateBaby"
            type="date"
            value={dueDateBaby}
            onChange={(e) => setDueDateBaby(e.target.value)}
            required
          />
          
          <Input
            label="When would you like to start maternity leave?"
            id="maternityStartDate"
            type="date"
            value={maternityStartDate}
            onChange={(e) => setMaternityStartDate(e.target.value)}
            required
          />
          
          <Input
            label="When would you like to return to work? (Optional)"
            id="plannedReturnDate"
            type="date"
            value={plannedReturnDate}
            onChange={(e) => setPlannedReturnDate(e.target.value)}
          />
          
          <Select
            label="Please check your eligibility for SPL"
            id="eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            options={eligibilityOptions}
            required
          />
          
          <Select
            label="What enhanced (contractual) pay does your school pay?"
            id="payScheme"
            value={payScheme}
            onChange={(e) => setPayScheme(e.target.value)}
            options={paySchemeOptions}
            required
          />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>School Term Breaks</CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Easter Break</h3>
              <Input
                label="Start Date"
                id="easterBreakStart"
                type="date"
                value={easterBreakStart}
                onChange={(e) => setEasterBreakStart(e.target.value)}
              />
              <Input
                label="End Date"
                id="easterBreakEnd"
                type="date"
                value={easterBreakEnd}
                onChange={(e) => setEasterBreakEnd(e.target.value)}
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">May Half-Term</h3>
              <Input
                label="Start Date"
                id="mayHalfTermStart"
                type="date"
                value={mayHalfTermStart}
                onChange={(e) => setMayHalfTermStart(e.target.value)}
              />
              <Input
                label="End Date"
                id="mayHalfTermEnd"
                type="date"
                value={mayHalfTermEnd}
                onChange={(e) => setMayHalfTermEnd(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Summer Break</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                id="summerBreakStart"
                type="date"
                value={summerBreakStart}
                onChange={(e) => setSummerBreakStart(e.target.value)}
              />
              <Input
                label="End Date"
                id="summerBreakEnd"
                type="date"
                value={summerBreakEnd}
                onChange={(e) => setSummerBreakEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-8 text-center">
        <Button onClick={calculateBreakdown}>Calculate Weekly Breakdown</Button>
      </div>
      
      {showResults && (
        <>
          <Card className="mb-8">
            <CardHeader>Summary of Pay</CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-neutral-700">Normal Maternity Pay</p>
                  <p className="text-xl font-bold">£{normalMaternityPay.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-700">Optimized SPL Pay</p>
                  <p className="text-xl font-bold">£{optimizedSplPay.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-700">Extra Gain</p>
                  <p className="text-xl font-bold text-success">£{extraGain.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>Phase-by-Phase Breakdown</CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Weeks</TableHead>
                    <TableHead>Weekly Amount</TableHead>
                    <TableHead>Total for Phase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phaseBreakdown.map((phase, index) => (
                    <TableRow key={index}>
                      <TableCell>{phase.type}</TableCell>
                      <TableCell>
                        {phase.start} to {phase.end} ({phase.end - phase.start + 1} weeks)
                      </TableCell>
                      <TableCell>£{phase.amount.toFixed(2)}</TableCell>
                      <TableCell>£{(phase.amount * (phase.end - phase.start + 1)).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>Weekly Pay Breakdown</CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date (Mon)</TableHead>
                      <TableHead>Week #</TableHead>
                      <TableHead>Standard Pay</TableHead>
                      <TableHead>Optimized Pay</TableHead>
                      <TableHead>Pay Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyBreakdown.map((week, index) => (
                      <TableRow key={index}>
                        <TableCell>{week.date}</TableCell>
                        <TableCell>{week.weekNumber}</TableCell>
                        <TableCell>£{week.weeklyPay}</TableCell>
                        <TableCell className={week.optimizedPay > week.weeklyPay ? "text-success font-medium" : ""}>
                          £{week.optimizedPay}
                        </TableCell>
                        <TableCell>{week.payType}</TableCell>
                        <TableCell>{week.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default App;