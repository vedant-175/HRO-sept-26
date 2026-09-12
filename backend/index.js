const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const DecisionEngine = require('./decisionEngine');

const app = express();
app.use(cors());

const datasetDir = path.join(__dirname, '..', 'dataset');
const engine = new DecisionEngine(datasetDir);

// Helper function to replace event_classifier.py logic
function getClassifiedEvents(userId, dataLoader) {
    const events = dataLoader.events.filter(e => e.user_id === userId);
    const superseded = new Set();
    for (const ev of events) {
        if (ev.linked_event_id && ev.linked_event_id.trim() !== '') {
            superseded.add(ev.linked_event_id.trim());
        }
    }
    return events.filter(e => !superseded.has(e.event_id));
}

// Helper function to replace simulator.py logic
function get90DayLedger(startDateStr, homeCurrency, initialBalance, activeEvents, paymentPlanDict, dataLoader) {
    const ledger = {};
    let currentBalance = parseFloat(initialBalance);
    const startDate = new Date(startDateStr);
    
    // Convert activeEvents to array of objects we can safely modify
    const events = activeEvents.map(e => ({ ...e }));

    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);
        
        let dailyNet = 0.0;
        
        for (const ev of events) {
            if (ev.is_cancelled) continue;
            
            const evDate = new Date(ev.event_date);
            let isTrigger = false;
            
            if (ev.is_recurring === 'True' || ev.is_recurring === true) {
                if (currentDate >= evDate && currentDate.getDate() === evDate.getDate()) {
                    isTrigger = true;
                }
            } else {
                if (currentDate.toISOString().split('T')[0] === evDate.toISOString().split('T')[0]) {
                    isTrigger = true;
                }
            }
            
            if (isTrigger) {
                const rate = dataLoader.getExchangeRate(ev.currency, homeCurrency, currentDate.toISOString());
                dailyNet += parseFloat(ev.amount) * rate;
            }
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];
        if (paymentPlanDict && paymentPlanDict[dateStr]) {
            dailyNet -= paymentPlanDict[dateStr];
        }
        
        currentBalance += dailyNet;
        ledger[dateStr] = currentBalance;
    }
    return ledger;
}

app.get('/requests', (req, res) => {
    res.json({ requests: engine.dataLoader.requests });
});

app.get('/requests/:req_id/decision', async (req, res) => {
    const reqId = req.params.req_id;
    const reqRow = engine.dataLoader.requests.find(r => r.request_id === reqId);
    
    if (!reqRow) {
        return res.status(404).json({ detail: "Request not found" });
    }
    
    const datasetDir = path.join(__dirname, '..', 'dataset');
    const outputCsvPath = path.join(datasetDir, 'output.csv');
    
    let decision = null;
    if (fs.existsSync(outputCsvPath)) {
        const content = fs.readFileSync(outputCsvPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            for (let i = 1; i < lines.length; i++) {
                let inQuote = false;
                let current = '';
                const parsedRow = [];
                for (let char of lines[i]) {
                    if (char === '"') inQuote = !inQuote;
                    else if (char === ',' && !inQuote) { parsedRow.push(current); current = ''; }
                    else current += char;
                }
                parsedRow.push(current);
                
                const obj = {};
                headers.forEach((h, idx) => {
                    obj[h] = parsedRow[idx] !== undefined ? parsedRow[idx].trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';
                });
                
                if (obj.request_id === reqId) {
                    decision = obj;
                    break;
                }
            }
        }
    }

    if (!decision) {
        // Fallback if not found in CSV
        decision = {
            request_id: reqId,
            amount_safe_to_pay: 0.0,
            affordability_status: "not_affordable",
            recommended_payment_method: "not_recommended",
            payment_plan: "none",
            earliest_date_for_full_payment: "",
            spending_changes_needed: "none",
            decision_explanation: "Agent failed to process or request missing from output.csv."
        };
    }
    
    const userId = reqRow.user_id;
    const profile = engine.dataLoader.profiles.find(p => p.user_id === userId);
    
    let ledgerData = [];
    let minBalance = 0;

    if (profile) {
        const homeCurrency = profile.home_currency;
        const initialBalance = profile.available_balance;
        minBalance = parseFloat(profile.minimum_balance_to_keep);
        
        const activeEvents = getClassifiedEvents(userId, engine.dataLoader);
        
        let bestPlanDict = null;
        if (decision.payment_plan && decision.payment_plan !== 'none') {
            bestPlanDict = {};
            const pmts = decision.payment_plan.split('|');
            for (const p of pmts) {
                const [d, a] = p.split(':');
                if (d && a) {
                    bestPlanDict[d] = parseFloat(a);
                }
            }
        }
        
        const ledger = get90DayLedger(reqRow.request_date, homeCurrency, initialBalance, activeEvents, bestPlanDict, engine.dataLoader);
        
        for (const [date, balance] of Object.entries(ledger)) {
            ledgerData.push({ date, balance });
        }
        // sort by date just to be sure
        ledgerData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    res.json({
        decision: decision,
        ledger: ledgerData,
        minimum_balance_to_keep: minBalance
    });
});

app.get('/users', (req, res) => {
    res.json({ users: engine.dataLoader.profiles });
});

app.get('/users/:user_id/ledger', (req, res) => {
    const userId = req.params.user_id;
    const profile = engine.dataLoader.profiles.find(p => p.user_id === userId);
    
    if (!profile) {
        return res.status(404).json({ detail: "User not found" });
    }
    
    const homeCurrency = profile.home_currency;
    const initialBalance = profile.available_balance;
    const minBalance = parseFloat(profile.minimum_balance_to_keep);
    
    const userRequests = engine.dataLoader.requests.filter(r => r.user_id === userId);
    let startDateStr = new Date().toISOString().split('T')[0];
    
    if (userRequests.length > 0) {
        // Sort requests by date and get min
        const sortedReqs = [...userRequests].sort((a, b) => new Date(a.request_date) - new Date(b.request_date));
        startDateStr = sortedReqs[0].request_date;
    }
    
    const activeEvents = getClassifiedEvents(userId, engine.dataLoader);
    
    const ledger = get90DayLedger(startDateStr, homeCurrency, initialBalance, activeEvents, null, engine.dataLoader);
    
    const ledgerData = Object.entries(ledger)
        .map(([date, balance]) => ({ date, balance }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    const requestsData = userRequests.map(r => {
        // Mocking the decision for this endpoint to keep it sync, just return empty decision placeholder
        // In full implementation, we'd process them asynchronously or cache
        return {
            ...r,
            decision: {
                request_id: r.request_id,
                amount_safe_to_pay: 0,
                affordability_status: "unknown"
            }
        };
    });
    
    const eventsData = activeEvents
        .filter(e => e.event_type === 'one_time')
        .map(e => ({
            date: e.event_date,
            amount: parseFloat(e.amount)
        }));
        
    res.json({
        ledger: ledgerData,
        minimum_balance_to_keep: minBalance,
        requests: requestsData,
        one_time_expenses: eventsData
    });
});

// Initialize data and start server
const port = process.env.PORT || 8000;
engine.init().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}).catch(err => {
    console.error("Failed to initialize engine:", err);
});
