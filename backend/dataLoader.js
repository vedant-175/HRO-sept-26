const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class DataLoader {
    constructor(datasetDir) {
        this.datasetDir = datasetDir;
        this.exchangeRates = [];
        this.profiles = [];
        this.events = [];
        this.requests = [];
        this.paymentOptions = [];
        this.messages = [];
        this.images = [];
    }

    async loadCsv(filename) {
        const filePath = path.join(this.datasetDir, filename);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        });
    }

    async loadAll() {
        this.exchangeRates = await this.loadCsv('exchange_rates.csv');
        // Convert rates to floats
        this.exchangeRates = this.exchangeRates.map(r => ({
            ...r,
            rate: parseFloat(r.rate)
        }));

        this.profiles = await this.loadCsv('financial_profiles.csv');
        this.events = await this.loadCsv('financial_events.csv');
        
        this.requests = await this.loadCsv('requests.csv');
        this.requests = this.requests.map(r => ({
            ...r,
            requested_amount: parseFloat(r.requested_amount)
        }));

        this.paymentOptions = await this.loadCsv('request_payment_options.csv');
        this.messages = await this.loadCsv('messages.csv');
        this.images = await this.loadCsv('images.csv');
    }

    getExchangeRate(fromCurrency, toCurrency, dateStr) {
        if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
            return 1.0;
        }

        if (this.exchangeRates.length === 0) {
            return 1.0;
        }

        const dateObj = new Date(dateStr);

        // Try direct conversion
        const directRates = this.exchangeRates.filter(r => 
            r.currency === fromCurrency && 
            r.base_currency === toCurrency && 
            new Date(r.date) <= dateObj
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (directRates.length > 0) {
            return directRates[0].rate;
        }

        // Try inverse conversion
        const inverseRates = this.exchangeRates.filter(r => 
            r.currency === toCurrency && 
            r.base_currency === fromCurrency && 
            new Date(r.date) <= dateObj
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (inverseRates.length > 0 && inverseRates[0].rate !== 0) {
            return 1.0 / inverseRates[0].rate;
        }

        // Try cross conversion (via a common base)
        const fromRates = this.exchangeRates.filter(r => 
            r.currency === fromCurrency && 
            new Date(r.date) <= dateObj
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        const toRates = this.exchangeRates.filter(r => 
            r.currency === toCurrency && 
            new Date(r.date) <= dateObj
        ).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (fromRates.length > 0 && toRates.length > 0) {
            const fromRate = fromRates[0];
            const toRate = toRates[0];

            if (fromRate.base_currency === toRate.base_currency && toRate.rate !== 0) {
                return fromRate.rate / toRate.rate;
            }
        }

        return 1.0;
    }

    getUserHomeCurrency(userId) {
        const prof = this.profiles.find(p => p.user_id === userId);
        return prof ? prof.home_currency : 'USD';
    }
}

module.exports = DataLoader;
