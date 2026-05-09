const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const BOSS_CONFIG = {
  '안사스': 10800, // 3시간 (초 단위)
  '크나쉬': 10800,
  '우라무': 10800
};

let bossStatus = {}; // 보스별 남은 시간 및 타이머 저장

// 시간을 00:00:00 형태로 포맷하는 함수
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📢 안사스 젠 완료 (5초 뒤 카운트)', callback_data: 'spawn_안사스' }],
        [{ text: '📋 현황 확인', callback_data: 'status' }]
      ]
    }
  };
  bot.sendMessage(chatId, '아이온2 실시간 보스 알람입니다.', keyboard);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const boss = query.data.replace('spawn_', '');

  if (query.data.startsWith('spawn_')) {
    bot.sendMessage(chatId, `✅ [${boss}] 젠 확인! 5초 뒤에 다음 젠 카운트다운을 시작합니다.`);

    // 1. 5초 뒤에 실행
    setTimeout(() => {
      const nextGenTime = BOSS_CONFIG[boss]; // 다음 젠까지 남은 초
      startTimer(chatId, boss, nextGenTime);
    }, 5000); // 5000ms = 5초
  }
});

function startTimer(chatId, boss, seconds) {
  let remaining = seconds;
  
  // 실시간 현황판 메시지 전송
  bot.sendMessage(chatId, `⏰ [${boss}] 다음 젠까지: ${formatTime(remaining)}`).then((sentMsg) => {
    const messageId = sentMsg.message_id;

    // 2. 1초마다 메시지 수정 (실시간 연동)
    const timer = setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        clearInterval(timer);
        bot.editMessageText(`🚨 [${boss}] 지금 출현!! 🚨`, { chat_id: chatId, message_id: messageId });
        bot.sendMessage(chatId, `🔔 [${boss}] 보스가 나타났습니다! 어서 확인하세요!`);
      } else {
        // 메시지 내용을 1초마다 업데이트
        bot.editMessageText(`⏰ [${boss}] 다음 젠까지: ${formatTime(remaining)}`, {
          chat_id: chatId,
          message_id: messageId
        }).catch(() => {
          // 메시지 수정 에러 방지 (사용자가 메시지를 지웠을 때 등)
          clearInterval(timer);
        });
      }
    }, 1000); // 1000ms = 1초
  });
}
