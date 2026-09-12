const fs = require('fs');
const path = require('path');

const datasetDir = path.join(__dirname, '..', '..', 'dataset');
const outputCsvPath = path.join(datasetDir, 'output.csv');
const requestsCsvPath = path.join(datasetDir, 'requests.csv');
const reportPath = path.join(__dirname, '..', '..', 'evaluation', 'workflow_report.md');

// Helper to parse CSV simply
function parseCsv(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        let inQuote = false;
        let current = '';
        const parsedRow = [];
        for (let char of lines[i]) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                parsedRow.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        parsedRow.push(current);

        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = parsedRow[idx] !== undefined ? parsedRow[idx].trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';
        });
        data.push(obj);
    }
    return data;
}

function evaluate() {
    console.log('Running Evaluation Workflow...');
    const outputData = parseCsv(outputCsvPath);
    const requestsData = parseCsv(requestsCsvPath);
    
    let report = `# Evaluation Workflow Report\n\n`;
    report += `*Generated At: ${new Date().toLocaleString()}*\n\n`;
    report += `## Summary\n`;
    report += `- Total Input Requests: ${requestsData.length}\n`;
    report += `- Total Processed Outputs: ${outputData.length}\n`;
    
    if (outputData.length !== requestsData.length) {
        report += `- **WARNING:** Missing ${requestsData.length - outputData.length} requests in output.csv\n\n`;
    } else {
        report += `- **SUCCESS:** All requests successfully processed.\n\n`;
    }
    
    let stats = {
        'affordable_now': 0,
        'affordable_with_plan': 0,
        'affordable_later': 0,
        'not_affordable': 0,
        'error': 0
    };
    
    let methods = {};
    let schemaErrors = 0;
    
    outputData.forEach((row, i) => {
        // Schema Validation
        const requiredHeaders = [
            'request_id', 'amount_safe_to_pay', 'affordability_status', 
            'recommended_payment_method', 'payment_plan', 
            'earliest_date_for_full_payment', 'spending_changes_needed', 'decision_explanation'
        ];
        
        let hasAllHeaders = requiredHeaders.every(h => Object.keys(row).includes(h));
        if (!hasAllHeaders) schemaErrors++;
        
        const status = row.affordability_status;
        if (stats[status] !== undefined) {
            stats[status]++;
        } else {
            stats['error']++;
        }
        
        const method = row.recommended_payment_method;
        if (method) {
            methods[method] = (methods[method] || 0) + 1;
        }
    });
    
    report += `## Affordability Breakdown\n`;
    report += `- **Affordable Now:** ${stats.affordable_now}\n`;
    report += `- **Affordable With Plan:** ${stats.affordable_with_plan}\n`;
    report += `- **Affordable Later:** ${stats.affordable_later}\n`;
    report += `- **Not Affordable:** ${stats.not_affordable}\n`;
    report += `- **Errors:** ${stats.error}\n\n`;
    
    report += `## Recommended Payment Methods\n`;
    for (const [method, count] of Object.entries(methods)) {
        report += `- **${method}:** ${count}\n`;
    }
    
    report += `\n## Schema Validation\n`;
    if (schemaErrors === 0) {
        report += `✅ All rows comply with the required 8-column schema.\n`;
    } else {
        report += `❌ ${schemaErrors} rows failed schema validation.\n`;
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`Evaluation complete. Report generated at ${reportPath}`);
}

evaluate();
