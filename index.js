const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;

// Верификация вебхука
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Обработка входящих событий
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'instagram') {
        body.entry.forEach(async (entry) => {
            const changes = entry.changes;
            changes.forEach(async (change) => {
                if (change.field === 'comments') {
                    const commentId = change.value.comment_id;
                    const commentText = change.value.text.toLowerCase();

                    if (commentText.includes('test') || commentText.includes('тест')) {
                        const userId = change.value.from.id;

                        await sendDirectMessage(userId, `Приветствую! Спасибо за ваш интерес! Чтобы получить бесплатный гайд 
                        «5 шагов, как победить апатию», перейдите, пожалуйста, в наш чат-бот (кликните на ссылку ниже), чтобы удобно получить материалы и задать вопросы.\r\n
                        https://t.me/annamosk_bot`);
                    }
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Функция для отправки сообщений
async function sendDirectMessage(recipientId, messageText) {
    const url = `https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const message = {
        recipient: { id: recipientId },
        message: { text: messageText },
    };

    try {
        console.log('Sending message:', message);
        await axios.post(url, message);
        console.log('Message sent!');
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
}

// Обработка запроса на URL /privacy-policy
app.get('/privacy-policy', (req, res) => {
    const privacyPolicyText = `
        Privacy Policy for Instagram Bot

        This Privacy Policy describes how we collect, use, and handle your information when you interact with our Instagram bot.

        1. Information We Collect
        We collect:
        - Instagram usernames and IDs
        - Comments and messages sent to the bot

        2. How We Use Information
        The information is used to:
        - Respond to user messages
        - Provide relevant content and services

        3. Data Protection
        We do not share your data with third parties. All data is securely stored and handled according to applicable laws.

        Contact us at support@yourdomain.com for any privacy-related questions.
    `;
    res.type('text/plain');
    res.send(privacyPolicyText);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
