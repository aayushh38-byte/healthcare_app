const { OpenAI } = require('openai');

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Mock response for testing
const MOCK_RESPONSE = {
    possible_conditions: ["Common Cold", "Seasonal Allergies"],
    recommended_specialties: ["General Physician", "ENT Specialist"],
    urgency_level: "low",
    advice: {
        self_care: ["Rest and hydration", "Over-the-counter antihistamines"],
        when_to_see_doctor: "If symptoms persist for more than a week or worsen.",
        questions_for_doctor: ["Is this contagious?", "Do I need antibiotics?"]
    }
};

const MOCK_FOLLOW_UP = {
    follow_up_question: "Can you describe the severity of your headache?"
};

const SYSTEM_PROMPT = `You are a medical assistant that provides safe, non-diagnostic guidance in simple language. Always avoid giving definitive diagnoses. If the user describes emergency symptoms (chest pain, severe breathlessness, sudden weakness, severe bleeding), respond with "urgency_level": "high" and advise seeking emergency help. If the user's description is too vague, ask one clear follow-up question by returning {"follow_up_question":"..."} and do NOT return the structured fields.

When giving suggestions, be concise. Output ONLY a single valid JSON object matching either:
A) {
"possible_conditions": ["..."],
"recommended_specialties": ["..."],
"urgency_level":"low"|"medium"|"high",
"advice":{
"self_care":["..."],
"when_to_see_doctor":"...",
"questions_for_doctor":["..."]
}
}
OR
B) { "follow_up_question": "..." }

Do not include any other keys or commentary. Keep lists short (1-6 items). Use layman language.`;

async function analyzeSymptoms(symptoms) {
    if (!symptoms || symptoms.trim().length === 0) {
        throw new Error('Symptoms cannot be empty');
    }

    if (AI_PROVIDER === 'mock') {
        console.log('Using Mock AI Provider');
        // Simple logic to return follow-up if input is very short
        if (symptoms.length < 10) {
            return MOCK_FOLLOW_UP;
        }
        // Check for urgent keywords in mock mode
        if (symptoms.toLowerCase().includes('chest pain') || symptoms.toLowerCase().includes('bleeding')) {
            return {
                ...MOCK_RESPONSE,
                urgency_level: 'high',
                possible_conditions: ['Emergency Condition'],
                advice: {
                    ...MOCK_RESPONSE.advice,
                    when_to_see_doctor: 'IMMEDIATELY call emergency services.'
                }
            };
        }
        return MOCK_RESPONSE;
    }

    if (AI_PROVIDER === 'openai') {
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is missing');
        }
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `User symptoms: ${symptoms}` }
                ],
                model: process.env.AI_MODEL || 'gpt-3.5-turbo',
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error('Failed to process symptoms with AI provider');
        }
    }

    throw new Error(`Unsupported AI_PROVIDER: ${AI_PROVIDER}`);
}

module.exports = {
    analyzeSymptoms
};
