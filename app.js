// Banking Financial Analysis Application JavaScript

// Metric calculation functions
function calculateMetrics() {
    // Get all input values
    const data = getInputData();
    
    // Calculate all metrics
    calculateGrowthMetrics(data);
    calculateProfitabilityMetrics(data);
    calculateAssetQualityMetrics(data);
    calculateEfficiencyMetrics(data);
    calculateCapitalAdequacyMetrics(data);
    calculateLiquidityMetrics(data);
}

function getInputData() {
    return {
        // Balance Sheet Data
        totalAssets: parseFloat(document.getElementById('total_assets').value) || 0,
        interestEarningAssets: parseFloat(document.getElementById('interest_earning_assets').value) || 0,
        cashEquivalents: parseFloat(document.getElementById('cash_equivalents').value) || 0,
        shortTermInvestments: parseFloat(document.getElementById('short_term_investments').value) || 0,
        grossAdvances: parseFloat(document.getElementById('gross_advances').value) || 0,
        grossNPAs: parseFloat(document.getElementById('gross_npas').value) || 0,
        provisionsNPAs: parseFloat(document.getElementById('provisions_npas').value) || 0,
        totalLiabilities: parseFloat(document.getElementById('total_liabilities').value) || 0,
        deposits: parseFloat(document.getElementById('deposits').value) || 0,
        externalDebt: parseFloat(document.getElementById('external_debt').value) || 0,
        shareholdersEquity: parseFloat(document.getElementById('shareholders_equity').value) || 0,
        riskWeightedAssets: parseFloat(document.getElementById('risk_weighted_assets').value) || 0,
        tier1Capital: parseFloat(document.getElementById('tier1_capital').value) || 0,
        tier2Capital: parseFloat(document.getElementById('tier2_capital').value) || 0,
        
        // Income Statement Data
        interestIncome: parseFloat(document.getElementById('interest_income').value) || 0,
        interestExpense: parseFloat(document.getElementById('interest_expense').value) || 0,
        nonInterestIncome: parseFloat(document.getElementById('non_interest_income').value) || 0,
        operatingIncome: parseFloat(document.getElementById('operating_income').value) || 0,
        operatingExpenses: parseFloat(document.getElementById('operating_expenses').value) || 0,
        provisionsWriteoffs: parseFloat(document.getElementById('provisions_writeoffs').value) || 0,
        netIncome: parseFloat(document.getElementById('net_income').value) || 0,
        
        // Previous Period Data
        prevAUM: parseFloat(document.getElementById('prev_aum').value) || 0,
        prevLoans: parseFloat(document.getElementById('prev_loans').value) || 0,
        prevDeposits: parseFloat(document.getElementById('prev_deposits').value) || 0,
        prevOperatingIncome: parseFloat(document.getElementById('prev_operating_income').value) || 0
    };
}

function calculateGrowthMetrics(data) {
    // AUM Growth
    const aumGrowth = data.prevAUM > 0 ? 
        ((data.totalAssets - data.prevAUM) / data.prevAUM * 100) : 0;
    updateMetric('aum_growth', aumGrowth, [15, 20, 25], 'growth');
    
    // Loan Growth
    const loanGrowth = data.prevLoans > 0 ? 
        ((data.grossAdvances - data.prevLoans) / data.prevLoans * 100) : 0;
    updateMetric('loan_growth', loanGrowth, [15, 20, 25], 'growth');
    
    // Deposit Growth
    const depositGrowth = data.prevDeposits > 0 ? 
        ((data.deposits - data.prevDeposits) / data.prevDeposits * 100) : 0;
    updateMetric('deposit_growth', depositGrowth, [15, 20, 25], 'growth');
    
    // Operating Income Growth
    const opIncomeGrowth = data.prevOperatingIncome > 0 ? 
        ((data.operatingIncome - data.prevOperatingIncome) / data.prevOperatingIncome * 100) : 0;
    updateMetric('op_income_growth', opIncomeGrowth, [12, 18, 24], 'growth');
}

function calculateProfitabilityMetrics(data) {
    // Net Interest Margin (NIM)
    const netInterestIncome = data.interestIncome - data.interestExpense;
    const nim = data.interestEarningAssets > 0 ? 
        (netInterestIncome / data.interestEarningAssets * 100) : 0;
    updateMetric('nim', nim, [3.0, 4.5, 6.0], 'profitability');
    
    // Gross NIM - Fixed calculation
    const grossNIM = data.interestEarningAssets > 0 ? 
        (data.interestIncome / data.interestEarningAssets * 100) : 0;
    updateMetric('gross_nim', grossNIM, [7, 10, 12], 'profitability');
    
    // ROA - Fixed calculation to use proper percentage
    const roa = data.totalAssets > 0 ? 
        (data.netIncome / data.totalAssets * 100) : 0;
    updateMetric('roa', roa, [1.0, 2.0, 3.0], 'profitability');
    
    // ROE
    const roe = data.shareholdersEquity > 0 ? 
        (data.netIncome / data.shareholdersEquity * 100) : 0;
    updateMetric('roe', roe, [12, 18, 25], 'profitability');
    
    // PPP % of AR (Pre-Provision Profits as % of Risk Assets)
    const preProvisionProfits = data.operatingIncome - data.operatingExpenses;
    const pppRatio = data.riskWeightedAssets > 0 ? 
        (preProvisionProfits / data.riskWeightedAssets * 100) : 0;
    updateMetric('ppp_ratio', pppRatio, [2.5, 4.0, 5.5], 'profitability');
}

function calculateAssetQualityMetrics(data) {
    // Gross NPA %
    const grossNPAPercent = data.grossAdvances > 0 ? 
        (data.grossNPAs / data.grossAdvances * 100) : 0;
    updateMetric('gross_npa', grossNPAPercent, [3, 1.5, 0.5], 'asset_quality');
    
    // Net NPA %
    const netNPAs = data.grossNPAs - data.provisionsNPAs;
    const netAdvances = data.grossAdvances - data.provisionsNPAs;
    const netNPAPercent = netAdvances > 0 ? (netNPAs / netAdvances * 100) : 0;
    updateMetric('net_npa', netNPAPercent, [1, 0.5, 0.1], 'asset_quality');
    
    // Credit Cost %
    const creditCost = data.riskWeightedAssets > 0 ? 
        (data.provisionsWriteoffs / data.riskWeightedAssets * 100) : 0;
    updateMetric('credit_cost', creditCost, [1, 0.5, 0.2], 'asset_quality');
    
    // Provision Coverage Ratio
    const provisionCoverage = data.grossNPAs > 0 ? 
        (data.provisionsNPAs / data.grossNPAs * 100) : 0;
    updateMetric('provision_coverage', provisionCoverage, [70, 85, 95], 'coverage');
}

function calculateEfficiencyMetrics(data) {
    // Efficiency Ratio
    const netInterestIncome = data.interestIncome - data.interestExpense;
    const totalRevenue = netInterestIncome + data.nonInterestIncome;
    const efficiencyRatio = totalRevenue > 0 ? 
        (data.operatingExpenses / totalRevenue * 100) : 0;
    updateMetric('efficiency_ratio', efficiencyRatio, [50, 40, 30], 'efficiency');
    
    // Cost-to-Income
    const costToIncome = data.operatingIncome > 0 ? 
        (data.operatingExpenses / data.operatingIncome * 100) : 0;
    updateMetric('cost_to_income', costToIncome, [60, 50, 40], 'efficiency');
}

function calculateCapitalAdequacyMetrics(data) {
    // Capital Adequacy Ratio (CAR)
    const totalCapital = data.tier1Capital + data.tier2Capital;
    const car = data.riskWeightedAssets > 0 ? 
        (totalCapital / data.riskWeightedAssets * 100) : 0;
    updateMetric('car', car, [11.5, 14, 16], 'capital');
    
    // External Debt/TNW (Tangible Net Worth = Shareholders Equity)
    const externalDebtTNW = data.shareholdersEquity > 0 ? 
        (data.externalDebt / data.shareholdersEquity * 100) : 0;
    updateMetric('external_debt_tnw', externalDebtTNW, [100, 75, 50], 'debt_ratio');
}

function calculateLiquidityMetrics(data) {
    // Loan-to-Deposit Ratio
    const loanToDeposit = data.deposits > 0 ? 
        (data.grossAdvances / data.deposits * 100) : 0;
    updateMetric('loan_to_deposit', loanToDeposit, [80, 75, 70], 'liquidity');
}

function updateMetric(metricId, value, thresholds, type) {
    const metricElement = document.getElementById(metricId);
    if (!metricElement) return;
    
    const valueElement = metricElement.querySelector('.metric-value');
    
    // Format the value
    let formattedValue = '-';
    if (value !== 0 && !isNaN(value) && isFinite(value)) {
        formattedValue = value.toFixed(2) + '%';
    }
    
    // Update the value with animation
    valueElement.classList.add('metric-updated');
    valueElement.textContent = formattedValue;
    
    // Remove animation class after animation completes
    setTimeout(() => {
        valueElement.classList.remove('metric-updated');
    }, 600);
    
    // Remove existing status classes
    metricElement.classList.remove('metric-excellent', 'metric-good', 'metric-average', 'metric-poor');
    
    // Apply status class based on thresholds and metric type
    if (value === 0 || isNaN(value) || !isFinite(value)) {
        return; // Don't apply status for invalid values
    }
    
    let statusClass = getMetricStatus(value, thresholds, type);
    metricElement.classList.add(statusClass);
}

function getMetricStatus(value, thresholds, type) {
    const [poor, average, good] = thresholds;
    
    switch (type) {
        case 'growth':
        case 'profitability':
        case 'coverage':
        case 'capital':
            // Higher is better
            if (value >= good) return 'metric-excellent';
            if (value >= average) return 'metric-good';
            if (value >= poor) return 'metric-average';
            return 'metric-poor';
            
        case 'asset_quality':
        case 'efficiency':
        case 'debt_ratio':
            // Lower is better
            if (value <= good) return 'metric-excellent';
            if (value <= average) return 'metric-good';
            if (value <= poor) return 'metric-average';
            return 'metric-poor';
            
        case 'liquidity':
            // Target range (70-80% for loan-to-deposit)
            if (value >= 70 && value <= 80) return 'metric-excellent';
            if (value >= 65 && value <= 85) return 'metric-good';
            if (value >= 60 && value <= 90) return 'metric-average';
            return 'metric-poor';
            
        default:
            return 'metric-average';
    }
}

// Fixed Clear All Data function
function clearAllData() {
    try {
        // Clear all input fields
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Reset all metric displays
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            const valueElement = card.querySelector('.metric-value');
            if (valueElement) {
                valueElement.textContent = '-';
            }
            // Remove status classes
            card.classList.remove('metric-excellent', 'metric-good', 'metric-average', 'metric-poor');
        });
        
        // Show confirmation
        showNotification('All data cleared successfully', 'success');
        
        // Force a recalculation to ensure metrics are reset
        calculateMetrics();
        
    } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Error clearing data', 'error');
    }
}

// Enhanced Export Results function
function exportResults() {
    try {
        // Show loading notification
        showNotification('Preparing export...', 'info');
        
        // Get current timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        
        // Get all input data for the report
        const data = getInputData();
        
        // Get all calculated metrics
        const metrics = [];
        const metricCards = document.querySelectorAll('.metric-card');
        
        metricCards.forEach(card => {
            const nameElement = card.querySelector('.metric-name');
            const valueElement = card.querySelector('.metric-value');
            const benchmarkElement = card.querySelector('.metric-benchmark');
            
            if (nameElement && valueElement && benchmarkElement) {
                const status = getCardStatus(card);
                metrics.push({
                    category: getMetricCategory(card),
                    name: nameElement.textContent.trim(),
                    value: valueElement.textContent.trim(),
                    benchmark: benchmarkElement.textContent.replace('Benchmark: ', '').trim(),
                    status: status
                });
            }
        });
        
        // Create comprehensive CSV content
        let csvContent = "Banking Financial Analysis Report\n";
        csvContent += `Generated on: ${now.toLocaleString()}\n\n`;
        
        // Add input data summary
        csvContent += "INPUT DATA SUMMARY\n";
        csvContent += "Category,Item,Value (₹ Cr)\n";
        csvContent += `Balance Sheet,Total Assets,${data.totalAssets}\n`;
        csvContent += `Balance Sheet,Gross Advances,${data.grossAdvances}\n`;
        csvContent += `Balance Sheet,Deposits,${data.deposits}\n`;
        csvContent += `Income Statement,Interest Income,${data.interestIncome}\n`;
        csvContent += `Income Statement,Net Income,${data.netIncome}\n`;
        csvContent += "\n";
        
        // Add calculated metrics
        csvContent += "CALCULATED METRICS\n";
        csvContent += "Category,Metric Name,Calculated Value,Benchmark,Status\n";
        
        metrics.forEach(metric => {
            csvContent += `"${metric.category}","${metric.name}","${metric.value}","${metric.benchmark}","${metric.status}"\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `banking_analysis_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success notification
            setTimeout(() => {
                showNotification('Results exported successfully!', 'success');
            }, 500);
        } else {
            // Fallback for browsers that don't support download attribute
            const url = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
            window.open(url);
            showNotification('Export opened in new window', 'info');
        }
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting results', 'error');
    }
}

function getCardStatus(card) {
    if (card.classList.contains('metric-excellent')) return 'Excellent';
    if (card.classList.contains('metric-good')) return 'Good';
    if (card.classList.contains('metric-average')) return 'Average';
    if (card.classList.contains('metric-poor')) return 'Poor';
    return 'Not Calculated';
}

function getMetricCategory(card) {
    const section = card.closest('.results-section');
    if (section) {
        const titleElement = section.querySelector('.results-category-title');
        return titleElement ? titleElement.textContent.trim() : 'Unknown';
    }
    return 'Unknown';
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: var(--font-family-base);
        font-size: var(--font-size-sm);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#22c55e';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add slide-in animation
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Input validation and formatting
function setupInputValidation() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Add formatting on blur
        input.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value) && this.value !== '') {
                const value = parseFloat(this.value);
                if (value >= 0) {
                    this.value = value.toFixed(2);
                }
            }
        });
        
        // Prevent negative values for most fields
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupInputValidation();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to Banking Financial Analysis Tool', 'info');
    }, 500);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+R or Cmd+R to clear all data (prevent default browser refresh)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            clearAllData();
        }
        
        // Ctrl+E or Cmd+E to export results
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportResults();
        }
    });
    
    // Ensure buttons are properly connected
    const clearBtn = document.querySelector('button[onclick="clearAllData()"]');
    const exportBtn = document.querySelector('button[onclick="exportResults()"]');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }
});

// Auto-save functionality (optional)
let autoSaveTimer;
function setupAutoSave() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                console.log('Auto-calculating metrics...');
            }, 1000);
        });
    });
}

// Call setupAutoSave after DOM is loaded
document.addEventListener('DOMContentLoaded', setupAutoSave);
