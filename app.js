// Banking Financial Analysis Application with AI Parser JavaScript

// Global variables for OCR and parsing
let currentImage = null;
let extractedText = '';
let documentMappings = {};
let imageScale = 1;

// Application Configuration
const APP_CONFIG = {
    ocrOptions: {
        language: 'eng',
        psm: 6,
        preserve_interword_spaces: 1
    },
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 10485760, // 10MB
    confidenceThresholds: {
        high: 0.8,
        medium: 0.6,
        low: 0.4
    }
};

// Field mapping configuration
const FIELD_MAPPINGS = {
    balance_sheet: {
        total_assets: ["total assets", "assets total", "total asset", "gross assets"],
        interest_earning_assets: ["interest earning assets", "earning assets", "loans and advances", "credit portfolio"],
        cash_equivalents: ["cash and cash equivalents", "cash equivalents", "liquid assets", "cash"],
        gross_advances: ["gross advances", "total loans", "loan portfolio", "advances", "credit"],
        gross_npas: ["gross npa", "non performing assets", "bad loans", "stressed assets"],
        total_liabilities: ["total liabilities", "liabilities", "total debt"],
        deposits: ["deposits", "customer deposits", "total deposits"],
        shareholders_equity: ["shareholders equity", "net worth", "equity", "capital"],
        external_debt: ["external debt", "borrowings", "debt"],
        provisions_npas: ["provisions", "npa provisions", "loan loss provisions"],
        risk_weighted_assets: ["risk weighted assets", "rwa", "credit risk assets"],
        tier1_capital: ["tier 1 capital", "cet1", "common equity"],
        tier2_capital: ["tier 2 capital", "supplementary capital"]
    },
    income_statement: {
        interest_income: ["interest income", "interest earned", "income from interest"],
        interest_expense: ["interest expense", "interest paid", "cost of funds"],
        non_interest_income: ["non interest income", "fee income", "other income"],
        operating_income: ["operating income", "total income", "revenue"],
        operating_expenses: ["operating expenses", "operational expenses", "expenses"],
        net_income: ["net income", "net profit", "pat", "profit after tax", "bottom line"],
        provisions_writeoffs: ["provisions", "write offs", "credit losses"]
    }
};

const CURRENCY_PATTERNS = {
    symbols: ["₹", "$", "€", "£", "¥"],
    units: ["cr", "crore", "crores", "lakh", "lakhs", "million", "billion", "thousand", "k", "m", "b"],
    multipliers: {
        cr: 10000000,
        crore: 10000000,
        lakh: 100000,
        million: 1000000,
        billion: 1000000000,
        k: 1000,
        m: 1000000,
        b: 1000000000
    }
};

// Tab Management - Fixed implementation
window.switchTab = function(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Remove active class from all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Add active class to selected tab content
    const selectedContent = document.getElementById(tabName);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    console.log('Tab switched successfully');
};

// File Upload and OCR Processing
function initializeFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) {
        console.warn('Upload elements not found');
        return;
    }
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
}

async function handleFileSelect(file) {
    if (!file) return;
    
    // Validate file
    if (!validateFile(file)) return;
    
    // Show processing status
    showProcessingStatus();
    
    try {
        // Process the image
        await processFinancialDocument(file);
    } catch (error) {
        console.error('Error processing file:', error);
        showNotification('Error processing document. Please try again.', 'error');
        hideProcessingStatus();
    }
}

function validateFile(file) {
    if (!APP_CONFIG.supportedFormats.includes(file.type)) {
        showNotification('Unsupported file format. Please upload PNG, JPG, or WebP files.', 'error');
        return false;
    }
    
    if (file.size > APP_CONFIG.maxFileSize) {
        showNotification('File size too large. Maximum size is 10MB.', 'error');
        return false;
    }
    
    return true;
}

function showProcessingStatus() {
    const processingStatus = document.getElementById('processing-status');
    const uploadArea = document.getElementById('upload-area');
    
    if (processingStatus) processingStatus.classList.remove('hidden');
    if (uploadArea) uploadArea.classList.add('processing');
    
    updateProgress(0, 'Preparing document...');
}

function hideProcessingStatus() {
    const processingStatus = document.getElementById('processing-status');
    const uploadArea = document.getElementById('upload-area');
    
    if (processingStatus) processingStatus.classList.add('hidden');
    if (uploadArea) uploadArea.classList.remove('processing');
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.querySelector('#processing-status .status-item span');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (statusText) statusText.textContent = text;
}

// OCR and Document Processing
async function processFinancialDocument(file) {
    try {
        // Show loading modal
        showLoadingModal('Processing Financial Statement...');
        updateModalProgress(10, 'Loading image...');
        
        // Create image preview
        const imageUrl = URL.createObjectURL(file);
        showImagePreview(imageUrl);
        currentImage = imageUrl;
        
        updateModalProgress(20, 'Initializing OCR engine...');
        
        // Perform OCR
        const ocrResult = await performOCR(file);
        extractedText = ocrResult.data.text;
        
        updateModalProgress(60, 'Analyzing document structure...');
        
        // Classify document type
        const documentType = classifyDocument(extractedText);
        
        updateModalProgress(80, 'Extracting financial data...');
        
        // Extract and map fields
        await extractFinancialFields(extractedText, documentType);
        
        updateModalProgress(100, 'Processing complete!');
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoadingModal();
            showMappingResults(documentType);
            hideProcessingStatus();
        }, 500);
        
    } catch (error) {
        hideLoadingModal();
        hideProcessingStatus();
        throw error;
    }
}

async function performOCR(file) {
    return new Promise((resolve, reject) => {
        const worker = Tesseract.createWorker({
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(40 + (m.progress * 20));
                    updateModalProgress(progress, `Recognizing text... ${Math.round(m.progress * 100)}%`);
                }
            }
        });
        
        (async () => {
            try {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                await worker.setParameters(APP_CONFIG.ocrOptions);
                
                const result = await worker.recognize(file);
                await worker.terminate();
                
                resolve(result);
            } catch (error) {
                await worker.terminate();
                reject(error);
            }
        })();
    });
}

function classifyDocument(text) {
    const lowerText = text.toLowerCase();
    
    // Check for balance sheet indicators
    const balanceSheetKeywords = ["balance sheet", "statement of financial position", "assets", "liabilities", "equity"];
    const incomeStatementKeywords = ["income statement", "profit and loss", "p&l", "revenue", "expenses"];
    
    let balanceSheetScore = 0;
    let incomeStatementScore = 0;
    
    balanceSheetKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) balanceSheetScore++;
    });
    
    incomeStatementKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) incomeStatementScore++;
    });
    
    if (balanceSheetScore > incomeStatementScore) {
        return 'balance_sheet';
    } else if (incomeStatementScore > 0) {
        return 'income_statement';
    }
    
    return 'unknown';
}

async function extractFinancialFields(text, documentType) {
    documentMappings = {};
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Get relevant field mappings for document type
    const relevantMappings = FIELD_MAPPINGS[documentType] || {};
    
    // Process each line for potential financial data
    lines.forEach((line, index) => {
        const cleanLine = line.trim().toLowerCase();
        
        // Try to match each field
        Object.keys(relevantMappings).forEach(fieldKey => {
            const keywords = relevantMappings[fieldKey];
            
            keywords.forEach(keyword => {
                if (cleanLine.includes(keyword.toLowerCase())) {
                    // Look for numerical values in this line and nearby lines
                    const value = extractNumericalValue(line, lines, index);
                    if (value !== null) {
                        const confidence = calculateConfidence(cleanLine, keyword, value);
                        
                        if (!documentMappings[fieldKey] || documentMappings[fieldKey].confidence < confidence) {
                            documentMappings[fieldKey] = {
                                value: value,
                                originalText: line.trim(),
                                confidence: confidence,
                                fieldName: getFieldDisplayName(fieldKey)
                            };
                        }
                    }
                }
            });
        });
    });
}

function extractNumericalValue(currentLine, allLines, currentIndex) {
    // Try to find numbers in current line first
    let value = findNumberInLine(currentLine);
    if (value !== null) return value;
    
    // Look in the next few lines
    for (let i = 1; i <= 3; i++) {
        if (currentIndex + i < allLines.length) {
            value = findNumberInLine(allLines[currentIndex + i]);
            if (value !== null) return value;
        }
    }
    
    return null;
}

function findNumberInLine(line) {
    // Remove common non-numeric characters and extract numbers
    const cleanLine = line.replace(/[,()]/g, '');
    
    // Look for patterns like: 1,234.56, (1,234), 1234 Cr, etc.
    const numberPatterns = [
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(cr|crore|crores|lakh|lakhs|million|billion|k|m|b)?/gi,
        /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(cr|crore|crores|lakh|lakhs|million|billion|k|m|b)?/gi,
        /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(million|billion|k|m|b)?/gi
    ];
    
    for (const pattern of numberPatterns) {
        const match = pattern.exec(cleanLine);
        if (match) {
            let numValue = parseFloat(match[1].replace(/,/g, ''));
            const unit = match[2] ? match[2].toLowerCase() : '';
            
            // Apply unit multiplier
            if (unit && CURRENCY_PATTERNS.multipliers[unit]) {
                numValue *= CURRENCY_PATTERNS.multipliers[unit];
            }
            
            // Convert to crores for consistency
            return numValue / 10000000;
        }
    }
    
    return null;
}

function calculateConfidence(line, keyword, value) {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for exact keyword matches
    if (line.includes(keyword.toLowerCase())) {
        confidence += 0.3;
    }
    
    // Higher confidence for reasonable financial values
    if (value > 0 && value < 1000000) { // Reasonable range in crores
        confidence += 0.2;
    }
    
    // Lower confidence for very small or very large values
    if (value < 0.01 || value > 10000000) {
        confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
}

function getFieldDisplayName(fieldKey) {
    const displayNames = {
        total_assets: 'Total Assets',
        interest_earning_assets: 'Interest Earning Assets',
        cash_equivalents: 'Cash & Cash Equivalents',
        gross_advances: 'Gross Advances/Loans',
        gross_npas: 'Gross NPAs',
        total_liabilities: 'Total Liabilities',
        deposits: 'Total Deposits',
        shareholders_equity: 'Shareholders Equity',
        external_debt: 'External Debt',
        provisions_npas: 'Provisions for NPAs',
        risk_weighted_assets: 'Risk Weighted Assets',
        tier1_capital: 'Tier 1 Capital',
        tier2_capital: 'Tier 2 Capital',
        interest_income: 'Interest Income',
        interest_expense: 'Interest Expense',
        non_interest_income: 'Non-Interest Income',
        operating_income: 'Operating Income',
        operating_expenses: 'Operating Expenses',
        net_income: 'Net Income/PAT',
        provisions_writeoffs: 'Provisions & Write-offs'
    };
    
    return displayNames[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Image Preview Functions
function showImagePreview(imageUrl) {
    const previewSection = document.getElementById('preview-section');
    const previewImage = document.getElementById('preview-image');
    
    if (previewImage) previewImage.src = imageUrl;
    if (previewSection) previewSection.classList.remove('hidden');
    
    // Reset image scale
    imageScale = 1;
    if (previewImage) previewImage.style.transform = `scale(${imageScale})`;
}

window.zoomImage = function(delta) {
    imageScale = Math.max(0.5, Math.min(3, imageScale + delta));
    const previewImage = document.getElementById('preview-image');
    if (previewImage) previewImage.style.transform = `scale(${imageScale})`;
};

window.resetImage = function() {
    imageScale = 1;
    const previewImage = document.getElementById('preview-image');
    if (previewImage) previewImage.style.transform = `scale(${imageScale})`;
};

// Field Mapping Display
function showMappingResults(documentType) {
    const mappingSection = document.getElementById('mapping-section');
    const extractedTextContainer = document.getElementById('extracted-text');
    const fieldMappingsContainer = document.getElementById('field-mappings-container');
    const documentTypeElement = document.getElementById('document-type');
    
    // Show document type
    if (documentTypeElement) {
        documentTypeElement.textContent = documentType.replace('_', ' ').toUpperCase();
        documentTypeElement.className = `doc-type-badge ${documentType}`;
    }
    
    // Show extracted text
    if (extractedTextContainer) {
        extractedTextContainer.textContent = extractedText;
    }
    
    // Show field mappings
    if (fieldMappingsContainer) {
        fieldMappingsContainer.innerHTML = '';
        
        if (Object.keys(documentMappings).length === 0) {
            fieldMappingsContainer.innerHTML = '<p class="empty-state">No financial fields detected. Please try a clearer image or adjust manually.</p>';
        } else {
            Object.keys(documentMappings).forEach(fieldKey => {
                const mapping = documentMappings[fieldKey];
                const mappingElement = createFieldMappingElement(fieldKey, mapping);
                fieldMappingsContainer.appendChild(mappingElement);
            });
        }
    }
    
    if (mappingSection) mappingSection.classList.remove('hidden');
}

function createFieldMappingElement(fieldKey, mapping) {
    const div = document.createElement('div');
    div.className = 'field-mapping';
    div.dataset.fieldKey = fieldKey;
    
    const confidenceClass = getConfidenceClass(mapping.confidence);
    
    div.innerHTML = `
        <div class="field-info">
            <div class="field-name">${mapping.fieldName}</div>
            <div class="field-value">${mapping.originalText}</div>
        </div>
        <div class="confidence-indicator">
            <span class="confidence-badge ${confidenceClass}">
                ${Math.round(mapping.confidence * 100)}%
            </span>
            <input type="number" step="0.01" value="${mapping.value.toFixed(2)}" 
                   onchange="updateMappingValue('${fieldKey}', this.value)">
        </div>
    `;
    
    return div;
}

function getConfidenceClass(confidence) {
    if (confidence >= APP_CONFIG.confidenceThresholds.high) return 'confidence-high';
    if (confidence >= APP_CONFIG.confidenceThresholds.medium) return 'confidence-medium';
    return 'confidence-low';
}

window.updateMappingValue = function(fieldKey, newValue) {
    if (documentMappings[fieldKey]) {
        documentMappings[fieldKey].value = parseFloat(newValue) || 0;
    }
};

// Apply Mappings to Form
window.applyMappings = function() {
    let appliedCount = 0;
    
    Object.keys(documentMappings).forEach(fieldKey => {
        const input = document.getElementById(fieldKey);
        if (input && documentMappings[fieldKey]) {
            input.value = documentMappings[fieldKey].value.toFixed(2);
            appliedCount++;
            
            // Add visual indicator that this field was populated by AI
            input.classList.add('ai-populated');
        }
    });
    
    // Recalculate metrics
    calculateMetrics();
    
    // Switch to results tab to show calculated metrics
    switchTab('results-dashboard');
    
    showNotification(`Successfully applied ${appliedCount} field mappings!`, 'success');
};

window.clearMappings = function() {
    documentMappings = {};
    const fieldMappingsContainer = document.getElementById('field-mappings-container');
    if (fieldMappingsContainer) {
        fieldMappingsContainer.innerHTML = '';
    }
    showNotification('Field mappings cleared', 'info');
};

// Loading Modal Functions
function showLoadingModal(title) {
    const modal = document.getElementById('loading-modal');
    const titleElement = modal ? modal.querySelector('h3') : null;
    
    if (titleElement) titleElement.textContent = title;
    if (modal) modal.classList.remove('hidden');
}

function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) modal.classList.add('hidden');
}

function updateModalProgress(percentage, text) {
    const progressFill = document.getElementById('modal-progress-fill');
    const loadingText = document.getElementById('loading-text');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (loadingText) loadingText.textContent = text;
}

// Banking Calculation Functions
function calculateMetrics() {
    const data = getInputData();
    
    calculateGrowthMetrics(data);
    calculateProfitabilityMetrics(data);
    calculateAssetQualityMetrics(data);
    calculateEfficiencyMetrics(data);
    calculateCapitalAdequacyMetrics(data);
    calculateLiquidityMetrics(data);
}

function getInputData() {
    return {
        totalAssets: parseFloat(document.getElementById('total_assets')?.value) || 0,
        interestEarningAssets: parseFloat(document.getElementById('interest_earning_assets')?.value) || 0,
        cashEquivalents: parseFloat(document.getElementById('cash_equivalents')?.value) || 0,
        shortTermInvestments: parseFloat(document.getElementById('short_term_investments')?.value) || 0,
        grossAdvances: parseFloat(document.getElementById('gross_advances')?.value) || 0,
        grossNPAs: parseFloat(document.getElementById('gross_npas')?.value) || 0,
        provisionsNPAs: parseFloat(document.getElementById('provisions_npas')?.value) || 0,
        totalLiabilities: parseFloat(document.getElementById('total_liabilities')?.value) || 0,
        deposits: parseFloat(document.getElementById('deposits')?.value) || 0,
        externalDebt: parseFloat(document.getElementById('external_debt')?.value) || 0,
        shareholdersEquity: parseFloat(document.getElementById('shareholders_equity')?.value) || 0,
        riskWeightedAssets: parseFloat(document.getElementById('risk_weighted_assets')?.value) || 0,
        tier1Capital: parseFloat(document.getElementById('tier1_capital')?.value) || 0,
        tier2Capital: parseFloat(document.getElementById('tier2_capital')?.value) || 0,
        interestIncome: parseFloat(document.getElementById('interest_income')?.value) || 0,
        interestExpense: parseFloat(document.getElementById('interest_expense')?.value) || 0,
        nonInterestIncome: parseFloat(document.getElementById('non_interest_income')?.value) || 0,
        operatingIncome: parseFloat(document.getElementById('operating_income')?.value) || 0,
        operatingExpenses: parseFloat(document.getElementById('operating_expenses')?.value) || 0,
        provisionsWriteoffs: parseFloat(document.getElementById('provisions_writeoffs')?.value) || 0,
        netIncome: parseFloat(document.getElementById('net_income')?.value) || 0,
        prevAUM: parseFloat(document.getElementById('prev_aum')?.value) || 0,
        prevLoans: parseFloat(document.getElementById('prev_loans')?.value) || 0,
        prevDeposits: parseFloat(document.getElementById('prev_deposits')?.value) || 0,
        prevOperatingIncome: parseFloat(document.getElementById('prev_operating_income')?.value) || 0
    };
}

function calculateGrowthMetrics(data) {
    const aumGrowth = data.prevAUM > 0 ? ((data.totalAssets - data.prevAUM) / data.prevAUM * 100) : 0;
    updateMetric('aum_growth', aumGrowth, [15, 20, 25], 'growth');
    
    const loanGrowth = data.prevLoans > 0 ? ((data.grossAdvances - data.prevLoans) / data.prevLoans * 100) : 0;
    updateMetric('loan_growth', loanGrowth, [15, 20, 25], 'growth');
    
    const depositGrowth = data.prevDeposits > 0 ? ((data.deposits - data.prevDeposits) / data.prevDeposits * 100) : 0;
    updateMetric('deposit_growth', depositGrowth, [15, 20, 25], 'growth');
    
    const opIncomeGrowth = data.prevOperatingIncome > 0 ? ((data.operatingIncome - data.prevOperatingIncome) / data.prevOperatingIncome * 100) : 0;
    updateMetric('op_income_growth', opIncomeGrowth, [12, 18, 24], 'growth');
}

function calculateProfitabilityMetrics(data) {
    const netInterestIncome = data.interestIncome - data.interestExpense;
    const nim = data.interestEarningAssets > 0 ? (netInterestIncome / data.interestEarningAssets * 100) : 0;
    updateMetric('nim', nim, [3.0, 4.5, 6.0], 'profitability');
    
    const grossNIM = data.interestEarningAssets > 0 ? (data.interestIncome / data.interestEarningAssets * 100) : 0;
    updateMetric('gross_nim', grossNIM, [7, 10, 12], 'profitability');
    
    const roa = data.totalAssets > 0 ? (data.netIncome / data.totalAssets * 100) : 0;
    updateMetric('roa', roa, [1.0, 2.0, 3.0], 'profitability');
    
    const roe = data.shareholdersEquity > 0 ? (data.netIncome / data.shareholdersEquity * 100) : 0;
    updateMetric('roe', roe, [12, 18, 25], 'profitability');
    
    const preProvisionProfits = data.operatingIncome - data.operatingExpenses;
    const pppRatio = data.riskWeightedAssets > 0 ? (preProvisionProfits / data.riskWeightedAssets * 100) : 0;
    updateMetric('ppp_ratio', pppRatio, [2.5, 4.0, 5.5], 'profitability');
}

function calculateAssetQualityMetrics(data) {
    const grossNPAPercent = data.grossAdvances > 0 ? (data.grossNPAs / data.grossAdvances * 100) : 0;
    updateMetric('gross_npa', grossNPAPercent, [3, 1.5, 0.5], 'asset_quality');
    
    const netNPAs = data.grossNPAs - data.provisionsNPAs;
    const netAdvances = data.grossAdvances - data.provisionsNPAs;
    const netNPAPercent = netAdvances > 0 ? (netNPAs / netAdvances * 100) : 0;
    updateMetric('net_npa', netNPAPercent, [1, 0.5, 0.1], 'asset_quality');
    
    const creditCost = data.riskWeightedAssets > 0 ? (data.provisionsWriteoffs / data.riskWeightedAssets * 100) : 0;
    updateMetric('credit_cost', creditCost, [1, 0.5, 0.2], 'asset_quality');
    
    const provisionCoverage = data.grossNPAs > 0 ? (data.provisionsNPAs / data.grossNPAs * 100) : 0;
    updateMetric('provision_coverage', provisionCoverage, [70, 85, 95], 'coverage');
}

function calculateEfficiencyMetrics(data) {
    const netInterestIncome = data.interestIncome - data.interestExpense;
    const totalRevenue = netInterestIncome + data.nonInterestIncome;
    const efficiencyRatio = totalRevenue > 0 ? (data.operatingExpenses / totalRevenue * 100) : 0;
    updateMetric('efficiency_ratio', efficiencyRatio, [50, 40, 30], 'efficiency');
    
    const costToIncome = data.operatingIncome > 0 ? (data.operatingExpenses / data.operatingIncome * 100) : 0;
    updateMetric('cost_to_income', costToIncome, [60, 50, 40], 'efficiency');
}

function calculateCapitalAdequacyMetrics(data) {
    const totalCapital = data.tier1Capital + data.tier2Capital;
    const car = data.riskWeightedAssets > 0 ? (totalCapital / data.riskWeightedAssets * 100) : 0;
    updateMetric('car', car, [11.5, 14, 16], 'capital');
    
    const externalDebtTNW = data.shareholdersEquity > 0 ? (data.externalDebt / data.shareholdersEquity * 100) : 0;
    updateMetric('external_debt_tnw', externalDebtTNW, [100, 75, 50], 'debt_ratio');
}

function calculateLiquidityMetrics(data) {
    const loanToDeposit = data.deposits > 0 ? (data.grossAdvances / data.deposits * 100) : 0;
    updateMetric('loan_to_deposit', loanToDeposit, [80, 75, 70], 'liquidity');
}

function updateMetric(metricId, value, thresholds, type) {
    const metricElement = document.getElementById(metricId);
    if (!metricElement) return;
    
    const valueElement = metricElement.querySelector('.metric-value');
    if (!valueElement) return;
    
    let formattedValue = '-';
    if (value !== 0 && !isNaN(value) && isFinite(value)) {
        formattedValue = value.toFixed(2) + '%';
    }
    
    valueElement.classList.add('metric-updated');
    valueElement.textContent = formattedValue;
    
    setTimeout(() => {
        valueElement.classList.remove('metric-updated');
    }, 600);
    
    metricElement.classList.remove('metric-excellent', 'metric-good', 'metric-average', 'metric-poor');
    
    if (value === 0 || isNaN(value) || !isFinite(value)) {
        return;
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
            if (value >= good) return 'metric-excellent';
            if (value >= average) return 'metric-good';
            if (value >= poor) return 'metric-average';
            return 'metric-poor';
            
        case 'asset_quality':
        case 'efficiency':
        case 'debt_ratio':
            if (value <= good) return 'metric-excellent';
            if (value <= average) return 'metric-good';
            if (value <= poor) return 'metric-average';
            return 'metric-poor';
            
        case 'liquidity':
            if (value >= 70 && value <= 80) return 'metric-excellent';
            if (value >= 65 && value <= 85) return 'metric-good';
            if (value >= 60 && value <= 90) return 'metric-average';
            return 'metric-poor';
            
        default:
            return 'metric-average';
    }
}

// Fixed Clear All Data function
window.clearAllData = function() {
    console.log('Clearing all data...');
    
    try {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('ai-populated');
        });
        
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            const valueElement = card.querySelector('.metric-value');
            if (valueElement) {
                valueElement.textContent = '-';
            }
            card.classList.remove('metric-excellent', 'metric-good', 'metric-average', 'metric-poor');
        });
        
        // Clear AI parsing data
        documentMappings = {};
        extractedText = '';
        currentImage = null;
        
        // Hide AI sections
        const previewSection = document.getElementById('preview-section');
        const mappingSection = document.getElementById('mapping-section');
        const processingStatus = document.getElementById('processing-status');
        
        if (previewSection) previewSection.classList.add('hidden');
        if (mappingSection) mappingSection.classList.add('hidden');
        if (processingStatus) processingStatus.classList.add('hidden');
        
        showNotification('All data cleared successfully', 'success');
        calculateMetrics();
        
        console.log('Data cleared successfully');
        
    } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Error clearing data', 'error');
    }
};

// Fixed Export Results function
window.exportResults = function() {
    console.log('Exporting results...');
    
    try {
        showNotification('Preparing export...', 'info');
        
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const data = getInputData();
        
        const metrics = [];
        const metricCards = document.querySelectorAll('.metric-card');
        
        metricCards.forEach(card => {
            const nameElement = card.querySelector('.metric-name');
            const valueElement = card.querySelector('.metric-value');
            const benchmarkElement = card.querySelector('.metric-benchmark');
            
            if (nameElement && valueElement && benchmarkElement) {
                const status = getCardStatus(card);
                const hasAIData = hasAIPopulatedData();
                metrics.push({
                    category: getMetricCategory(card),
                    name: nameElement.textContent.trim(),
                    value: valueElement.textContent.trim(),
                    benchmark: benchmarkElement.textContent.replace('Benchmark: ', '').trim(),
                    status: status,
                    dataSource: hasAIData ? 'AI Parsed' : 'Manual Input'
                });
            }
        });
        
        let csvContent = "Banking Financial Analysis Report with AI Parsing\n";
        csvContent += `Generated on: ${now.toLocaleString()}\n`;
        csvContent += `OCR Confidence: ${Object.keys(documentMappings).length} fields auto-detected\n\n`;
        
        csvContent += "INPUT DATA SUMMARY\n";
        csvContent += "Category,Item,Value (₹ Cr),Data Source\n";
        
        const inputFields = [
            ['Balance Sheet', 'Total Assets', data.totalAssets],
            ['Balance Sheet', 'Gross Advances', data.grossAdvances],
            ['Balance Sheet', 'Deposits', data.deposits],
            ['Income Statement', 'Interest Income', data.interestIncome],
            ['Income Statement', 'Net Income', data.netIncome]
        ];
        
        inputFields.forEach(([category, item, value]) => {
            const fieldId = item.toLowerCase().replace(/[^a-z]/g, '_');
            const input = document.getElementById(fieldId);
            const dataSource = input && input.classList.contains('ai-populated') ? 'AI Parsed' : 'Manual';
            csvContent += `"${category}","${item}","${value}","${dataSource}"\n`;
        });
        
        csvContent += "\nCALCULATED METRICS\n";
        csvContent += "Category,Metric Name,Calculated Value,Benchmark,Status,Data Source\n";
        
        metrics.forEach(metric => {
            csvContent += `"${metric.category}","${metric.name}","${metric.value}","${metric.benchmark}","${metric.status}","${metric.dataSource}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `banking_analysis_ai_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                showNotification('Results exported successfully!', 'success');
            }, 500);
        }
        
        console.log('Export completed successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting results', 'error');
    }
};

function hasAIPopulatedData() {
    const inputs = document.querySelectorAll('input.ai-populated');
    return inputs.length > 0;
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
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());
    
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
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: var(--font-family-base);
        font-size: var(--font-size-sm);
    `;
    
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
        input.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value) && this.value !== '') {
                const value = parseFloat(this.value);
                if (value >= 0) {
                    this.value = value.toFixed(2);
                }
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            // Auto-calculate metrics when inputs change
            calculateMetrics();
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Banking Financial Analysis Tool with AI Parser...');
    
    // Initialize all components
    initializeFileUpload();
    setupInputValidation();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to AI-Powered Banking Analysis Tool', 'info');
    }, 500);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            clearAllData();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportResults();
        }
        
        // Tab switching shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            switchTab('manual-input');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            switchTab('screenshot-parser');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '3') {
            e.preventDefault();
            switchTab('results-dashboard');
        }
    });
    
    console.log('Banking Financial Analysis Tool initialized successfully!');
});
