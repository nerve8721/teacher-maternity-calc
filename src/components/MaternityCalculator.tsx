import React, { useState } from 'react';

const App = () => {
  // Step tracking state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11; // Total number of steps/questions
  
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

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

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
      alert('Please fill in all required fields');
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

  // Component: Progress Bar
  const ProgressBar = ({ current, total }) => {
    const percentage = (current / total) * 100;
    
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between text-xs mb-1">
          <span>{current} of {total} completed</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render the current step based on the step number
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              What is your annual salary (£) inclusive of any TLRs etc?
            </label>
            <input
              type="number"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              required
              placeholder="e.g. 38000"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            />
            <div className="mt-8">
              <button 
                onClick={nextStep} 
                disabled={!annualSalary}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  annualSalary 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              What date is your baby due?
            </label>
            <input
              type="date"
              value={dueDateBaby}
              onChange={(e) => setDueDateBaby(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            />
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={!dueDateBaby}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  dueDateBaby 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              When would you like to start maternity leave?
            </label>
            <input
              type="date"
              value={maternityStartDate}
              onChange={(e) => setMaternityStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            />
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={!maternityStartDate}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  maternityStartDate 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              When would you like to return to work? (Optional)
            </label>
            <input
              type="date"
              value={plannedReturnDate}
              onChange={(e) => setPlannedReturnDate(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            />
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Please check your eligibility for SPL
            </label>
            <select
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            >
              <option value="">Select an option</option>
              {eligibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={!eligibility}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  eligibility 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              What enhanced (contractual) pay does your school pay?
            </label>
            <select
              value={payScheme}
              onChange={(e) => setPayScheme(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            >
              <option value="">Select an option</option>
              {paySchemeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={!payScheme}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  payScheme 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Easter Break</h3>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={easterBreakStart}
                onChange={(e) => setEasterBreakStart(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={easterBreakEnd}
                onChange={(e) => setEasterBreakEnd(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={Boolean(easterBreakStart) !== Boolean(easterBreakEnd)}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  Boolean(easterBreakStart) === Boolean(easterBreakEnd)
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 8:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">May Half-Term</h3>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={mayHalfTermStart}
                onChange={(e) => setMayHalfTermStart(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={mayHalfTermEnd}
                onChange={(e) => setMayHalfTermEnd(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                disabled={Boolean(mayHalfTermStart) !== Boolean(mayHalfTermEnd)}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  Boolean(mayHalfTermStart) === Boolean(mayHalfTermEnd)
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 9:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Summer Break</h3>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={summerBreakStart}
                onChange={(e) => setSummerBreakStart(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={summerBreakEnd}
                onChange={(e) => setSummerBreakEnd(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                disabled={Boolean(summerBreakStart) !== Boolean(summerBreakEnd)}
                className={`px-6 py-3 rounded-md font-medium text-lg ${
                  Boolean(summerBreakStart) === Boolean(summerBreakEnd)
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 10:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-6">Review Your Information</h3>
            
            <div className="mb-4 text-left">
              <p className="font-medium">Annual Salary: £{annualSalary}</p>
              <p className="font-medium">Baby Due Date: {dueDateBaby ? formatDate(dueDateBaby) : 'Not provided'}</p>
              <p className="font-medium">Maternity Start: {formatDate(maternityStartDate)}</p>
              <p className="font-medium">Planned Return: {plannedReturnDate ? formatDate(plannedReturnDate) : 'Not provided'}</p>
              <p className="font-medium">SPL Eligibility: {eligibilityOptions.find(o => o.value === eligibility)?.label}</p>
              <p className="font-medium">Pay Scheme: {paySchemeOptions.find(o => o.value === payScheme)?.label}</p>
              
              <h4 className="font-medium mt-4">School Breaks:</h4>
              {easterBreakStart && easterBreakEnd && (
                <p>Easter: {formatDate(easterBreakStart)} to {formatDate(easterBreakEnd)}</p>
              )}
              {mayHalfTermStart && mayHalfTermEnd && (
                <p>May Half-Term: {formatDate(mayHalfTermStart)} to {formatDate(mayHalfTermEnd)}</p>
              )}
              {summerBreakStart && summerBreakEnd && (
                <p>Summer: {formatDate(summerBreakStart)} to {formatDate(summerBreakEnd)}</p>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="px-6 py-3 rounded-md font-medium text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next
              </button>
            </div>
          </div>
        );
      
      case 11:
        // Final step - Calculate button
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Ready to Calculate Your Maternity Pay Plan</h3>
            <p className="mb-6 text-lg">
              We have all the information needed to calculate your optimized maternity and SPL pay plan.
            </p>
            <button 
              onClick={calculateBreakdown} 
              className="text-xl py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md"
            >
              Calculate Weekly Breakdown
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render results after calculation
  const renderResults = () => {
    return (
      <>
        <button 
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
          }}
          className="mb-8 px-6 py-3 rounded-md font-medium text-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Start New Calculation
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-indigo-600 p-4 text-white text-xl font-semibold">
            Summary of Pay
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-700">Normal Maternity Pay</p>
                <p className="text-2xl font-bold">£{normalMaternityPay.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700">Optimized SPL Pay</p>
                <p className="text-2xl font-bold">£{optimizedSplPay.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700">Extra Gain</p>
                <p className="text-2xl font-bold text-green-500">£{extraGain.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-indigo-600 p-4 text-white text-xl font-semibold">
            Phase-by-Phase Breakdown
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Weeks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Weekly Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Total for Phase
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {phaseBreakdown.map((phase, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {phase.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {phase.start} to {phase.end} ({phase.end - phase.start + 1} weeks)
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        £{phase.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        £{(phase.amount * (phase.end - phase.start + 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white text-xl font-semibold">
            Weekly Pay Breakdown
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date (Mon)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Week #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Standard Pay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Optimized Pay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Pay Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weeklyBreakdown.map((week, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {week.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {week.weekNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        £{week.weeklyPay}
                      </td>
                      <td className={`px-4 py-3 text-sm ${week.optimizedPay > week.weeklyPay ? "text-green-500 font-medium" : "text-gray-800"}`}>
                        £{week.optimizedPay}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {week.payType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {week.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Teacher Maternity & SPL Pay Calculator
      </h1>
      
      {!showResults && (
        <ProgressBar current={currentStep} total={totalSteps} />
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {!showResults ? renderStep() : renderResults()}
        </div>
      </div>
    </div>
  );
};

export default App;