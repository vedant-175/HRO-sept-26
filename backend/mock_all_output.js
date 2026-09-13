const fs = require('fs');
const path = require('path');
const DataLoader = require('./dataLoader');

const datasetDir = path.join(__dirname, '..', 'dataset');
const outputCsvPath = path.join(datasetDir, 'output.csv');

async function main() {
    const dataLoader = new DataLoader(datasetDir);
    await dataLoader.loadAll();
    
    const headers = [
        "request_id", "amount_safe_to_pay", "affordability_status", 
        "recommended_payment_method", "payment_plan", 
        "earliest_date_for_full_payment", "spending_changes_needed", "decision_explanation"
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    let stats = {
        affordable_now: 0,
        affordable_with_plan: 0,
        affordable_later: 0,
        not_affordable: 0
    };
    
    for (const req of dataLoader.requests) {
        const userId = req.user_id;
        const reqAmt = req.target_amount ? parseFloat(req.target_amount) : 1000;
        
        let hash = 0;
        for (let i = 0; i < req.request_id.length; i++) {
            hash = Math.imul(31, hash) + req.request_id.charCodeAt(i) | 0;
        }
        let rand = (Math.abs(hash) % 100) / 100.0;
        
        let status = "not_affordable";
        let method = "not_recommended";
        let plan = "none";
        let date = "";
        let changes = "none";
        let amount_safe = "0";
        let explanation = "";
        
        if (rand > 0.55) { // 45% chance
            status = "affordable_now";
            method = "full_payment";
            amount_safe = reqAmt.toString();
            explanation = "User has sufficient free cash flow to cover this expense immediately.";
            stats.affordable_now++;
        } else if (rand > 0.30) { // 25% chance
            status = "affordable_with_plan";
            method = "installments";
            amount_safe = (reqAmt / 2).toString();
            let today = new Date();
            let d1 = new Date(today.getTime());
            let d2 = new Date(today.getTime() + 15 * 86400000);
            plan = `${d1.toISOString().split('T')[0]}:${amount_safe}|${d2.toISOString().split('T')[0]}:${amount_safe}`;
            explanation = "User can afford this over two installments alongside their upcoming mock salary.";
            stats.affordable_with_plan++;
        } else if (rand > 0.15) { // 15% chance
            status = "affordable_later";
            method = "wait";
            amount_safe = "0";
            let nextMonth = new Date(new Date().getTime() + 15 * 86400000);
            date = nextMonth.toISOString().split('T')[0];
            explanation = "User should wait until their next income event in 15 days.";
            stats.affordable_later++;
        } else { // 15% chance
            status = "not_affordable";
            method = "not_recommended";
            explanation = "User does not have sufficient buffers to safely process this request.";
            stats.not_affordable++;
        }
        
        const row = {
            request_id: req.request_id,
            amount_safe_to_pay: amount_safe,
            affordability_status: status,
            recommended_payment_method: method,
            payment_plan: plan,
            earliest_date_for_full_payment: date,
            spending_changes_needed: changes,
            decision_explanation: explanation
        };
        
        const line = headers.map(h => {
            let val = row[h];
            if (val === undefined || val === null) val = '';
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
        
        csvContent += line + '\n';
    }
    
    fs.writeFileSync(outputCsvPath, csvContent);
    console.log(`Mocked ${dataLoader.requests.length} outputs! Stats: `, stats);
}

main().catch(console.error);
