const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
require('dotenv').config();

class LLMAgent {
    constructor(promptFilePath = 'master_prompt.txt') {
        const apiKey = process.env.GROQ_API_KEY;
        this.client = apiKey ? new Groq({ apiKey }) : null;
        
        try {
            this.systemPrompt = fs.readFileSync(path.resolve(__dirname, promptFilePath), 'utf-8');
        } catch (e) {
            console.error(`Could not read prompt file at ${promptFilePath}`);
            this.systemPrompt = "";
        }
    }

    async processRequest(payloadStr, images = [], maxRetries = 5) {
        if (!this.client) {
            throw new Error("GROQ_API_KEY not set");
        }

        const messages = [
            { role: "system", content: this.systemPrompt }
        ];

        let model;
        if (images && images.length > 0) {
            const content = [
                { type: "text", text: "Here is the compiled data for this request:\n" + payloadStr }
            ];
            for (const imgPath of images) {
                if (fs.existsSync(imgPath)) {
                    const base64Image = fs.readFileSync(imgPath).toString('base64');
                    content.push({
                        type: "image_url",
                        image_url: { url: `data:image/png;base64,${base64Image}` }
                    });
                }
            }
            messages.push({ role: "user", content: content });
            model = "openai/gpt-oss-20b";
        } else {
            messages.push({ role: "user", content: "Here is the compiled data for this request:\n" + payloadStr });
            model = "openai/gpt-oss-120b";
        }

        // Retry logic with exponential backoff
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: model,
                    messages: messages,
                    response_format: { type: "json_object" },
                    temperature: 0.0
                });

                const outputStr = response.choices[0].message.content;
                const outputJson = JSON.parse(outputStr);
                return outputJson;
            } catch (e) {
                console.log(`Error on attempt ${attempt + 1}/${maxRetries}:`, e.message);
                if (attempt === maxRetries - 1) {
                    console.log("Failed to process request completely.");
                    return null;
                }
                const waitTime = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        return null;
    }
}

module.exports = LLMAgent;
