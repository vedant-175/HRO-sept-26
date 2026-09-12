const fs = require('fs');
const path = require('path');
const DecisionEngine = require('./decisionEngine');

const datasetDir = path.join(__dirname, '..', 'dataset');
const engine = new DecisionEngine(datasetDir);

function writeToCsv(results, outputPath) {
    if (results.length === 0) return;
    
    const headers = [
        'request_id', 'amount_safe_to_pay', 'affordability_status', 
        'recommended_payment_method', 'payment_plan', 
        'earliest_date_for_full_payment', 'spending_changes_needed', 'decision_explanation'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    for (const row of results) {
        const rowValues = headers.map(header => {
            let val = row[header];
            if (val === undefined || val === null) val = '';
            val = String(val);
            // escape quotes and wrap in quotes to be safe
            val = val.replace(/"/g, '""');
            return `"${val}"`;
        });
        csvContent += rowValues.join(',') + '\n';
    }
    
    fs.writeFileSync(outputPath, csvContent);
}

async function processAllRequests() {
    await engine.init();
    
    const requests = engine.dataLoader.requests;
    const outputPath = path.join(datasetDir, 'output.csv');
    const results = [];
    
    console.log(`Total requests to process: ${requests.length}`);
    
    // Process in batches of 10 to avoid overwhelming the LLM API
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
        const batch = requests.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(requests.length / BATCH_SIZE)} (Requests ${i} to ${i + batch.length - 1})...`);
        
        const batchPromises = batch.map(async (row) => {
            const reqId = row.request_id;
            try {
                const result = await engine.processRequest(row);
                const decision = result.decision ? result.decision : result;
                
                return {
                    request_id: reqId,
                    amount_safe_to_pay: decision.amount_safe_to_pay !== undefined ? decision.amount_safe_to_pay : 0,
                    affordability_status: decision.affordability_status || 'error',
                    recommended_payment_method: decision.recommended_payment_method || 'error',
                    payment_plan: decision.payment_plan || 'none',
                    earliest_date_for_full_payment: decision.earliest_date_for_full_payment || '',
                    spending_changes_needed: decision.spending_changes_needed || 'none',
                    decision_explanation: decision.decision_explanation || 'Failed to process.'
                };
            } catch (e) {
                console.error(`Error on ${reqId}:`, e.message);
                return {
                    request_id: reqId,
                    amount_safe_to_pay: 0,
                    affordability_status: 'error',
                    recommended_payment_method: 'error',
                    payment_plan: 'none',
                    earliest_date_for_full_payment: '',
                    spending_changes_needed: 'none',
                    decision_explanation: String(e)
                };
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        writeToCsv(results, outputPath);
    }
    
    console.log("Done processing all requests.");
}

if (require.main === module) {
    processAllRequests().catch(console.error);
}

module.exports = { processAllRequests };
