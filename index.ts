import express from 'express';
import http from 'http';
import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Logger, { LogLevel } from './logger/Logger';
import { Server } from 'socket.io';

mongoose.connect('mongodb+srv://teleku:%40teleku123@telegram.wve6x3x.mongodb.net/Dbku', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as any);

const chatSchema = new mongoose.Schema({
    idTele: {
        type: Number,
        unique: true,
        required: true,
    },
    messages: [
        {
            timestamp: Date,
            messageId: Number,
            messageType: String,
            message: String,
        }
    ]
});

const Chat = mongoose.model('CustomChat', chatSchema, "Chat");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

dotenv.config();

const logger = new Logger(LogLevel.INFO);

const token: string | undefined = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    logger.error('Telegram bot token not provided in the environment variable.');
    process.exit(1);
}

try {
    const bot: TelegramBot = new TelegramBot(token, { polling: true });

    app.use(express.static(__dirname + '/public'));

    io.on('connection', (socket) => {
        logger.info('User connected: ' + socket.id);

        const handlePollingError = (error: Error) => {
            logger.error('Polling error: Maybe its same token or token not found!');
            bot.stopPolling();
            process.exit(1);
        };

        bot.on('polling_error', handlePollingError);

        logger.info('Bot Telegram is Running...');

        bot.on('message', async (msg) => {
            const chatId: Number = msg.chat.id;
            const data = { message: msg.text, chatId };
            socket.emit('bot message', data);
            const chat = await Chat.findOne({ idTele: chatId });
            if (chat) {
                chat.messages.push({
                    timestamp: new Date(),
                    messageId: msg.message_id,
                    messageType: "user",
                    message: msg.text,
                });

                await chat.save();
                logger.info('Message success push into array database.');
            } else {
                const newChat = new Chat({
                    idTele: chatId,
                    //lastChange
                    messages: [
                        {
                            timestamp: new Date(),
                            messageId: msg.message_id,
                            messageType: "user",
                            message: msg.text,
                        },
                    ]
                });

                await newChat.save();
                logger.info('Message success push into new database.');
            }
            logger.info('Bot Receive message from: ' + chatId);
        });

        socket.on('chat message', ({ message, idtele }) => {
            if (message && idtele) {
                bot.sendMessage(idtele, message)
                    .catch((error) => {
                        logger.warn(error);
                        if (error.response && error.response.statusCode === 400 && error.response.body.error_code === 400) {
                            socket.emit('error message', 'Failed to send message: Chat not found');
                        }
                    });
            } else {
                logger.info('Empty message from: ' + socket.id);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.warn('User disconnected: ' + socket.id);
        });
    });

    server.listen(3000, () => {
        logger.info('Server listening on port 3000');
    });
} catch (error) {
    const myStringValue: string = error as string;
    logger.warn(myStringValue);
    process.exit(1);
}
