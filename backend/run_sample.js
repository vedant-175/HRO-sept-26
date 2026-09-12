const fs = require('fs');
const path = require('path');
const DecisionEngine = require('./decisionEngine');

const datasetDir = path.join(__dirname, '..', 'dataset');
const outputCsvPath = path.join(datasetDir, 'output.csv');

async function main() {
    const engine = new DecisionEngine(datasetDir);
    await engine.init();
    
    // Select a diverse sample of 4 requests
    const targetRequests = ['request_26', 'request_27', 'request_28', 'request_31'];
    
    const sampleRows = engine.dataLoader.requests.filter(r => targetRequests.includes(r.request_id));
    
    const outputRows = [];
    
    // Process them one by one to respect rate limits
    for (const reqRow of sampleRows) {
        console.log(`Processing ${reqRow.request_id}...`);
        const result = await engine.processRequest(reqRow);
        if (result.decision) {
            outputRows.push(result.decision);
        } else {
            outputRows.push(result);
        }
        // Wait 10 seconds between requests to avoid TPM rate limits (3500 tokens per request, limit 8000 TPM -> ~2 reqs per minute)
        // Let's wait 30 seconds to be safe
        console.log('Waiting 30 seconds for Groq rate limits...');
        await new Promise(r => setTimeout(r, 30000));
    }
    
    // Write to output.csv
    const headers = [
        "request_id", "amount_safe_to_pay", "affordability_status", 
        "recommended_payment_method", "payment_plan", 
        "earliest_date_for_full_payment", "spending_changes_needed", "decision_explanation"
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    for (const row of outputRows) {
        const line = headers.map(h => {
            let val = row[h];
            if (val === undefined || val === null) val = '';
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
        csvContent += line + '\n';
    }
    
    fs.writeFileSync(outputCsvPath, csvContent);
    console.log(`Successfully generated sample output.csv with ${outputRows.length} rows.`);
}

main().catch(console.error);
