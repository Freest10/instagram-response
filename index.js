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

                    // Проверка на ключевое слово
                    if (commentText.includes('test') || commentText.includes('тест')) {
                        const userId = change.value.from.id;

                        // Отправка личного сообщения
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

// Функция для отправки сообщения
async function sendDirectMessage(recipientId, messageText) {
    const url = `https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const message = {
        recipient: { id: recipientId },
        message: { text: messageText },
    };

    try {
        await axios.post(url, message);
        console.log('Message sent!');
    } catch (error) {
        console.error('Error sending message:', error.response.data);
    }
}

app.listen(3000, () => console.log('Server is running on port 3000'));
