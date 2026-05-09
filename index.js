const TelegramBot = require('node-telegram-bot-api');

// 텔레그램 토큰 (Railway Variables에 넣은 값을 불러옵니다)
const token = process.env.DISCORD_TOKEN || process.env.TELEGRAM_TOKEN; 
const bot = new TelegramBot(token, { polling: true });

// 보스별 젠 시간 설정 (초 단위 - 예: 3시간 = 10800)
// 본인의 게임 설정에 맞게 숫자를 수정하세요.
const BOSSES = {
  '안사스': 10800,
  '크나쉬': 10800,
  '우라무': 10800,
  '세트람': 10800,
  '가르투아': 10800,
  '타르탄': 10800,
  '카샤파': 10800,
  '라그타': 10800
};

let bossData = {};

// 시간 포맷 함수
const formatTime = (date) => {
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
};

// 다음 보스 리스트 출력 함수
const nextList = () => {
  return Object.entries(bossData)
    .sort((a, b) => a[1] - b[1])
    .map(([name, time]) => `${name}: ${formatTime(time)}`)
    .join('\n');
};

// 보스 알림 스케줄 (임시 함수)
const scheduleBoss = (chatId, boss) => {
  console.log(`${boss} 알림 예약됨`);
};

// /start 명령어 시 키보드 출력
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '안사스', callback_data: 'kill_안사스' },
        ],
        [
          { text: '크나쉬', callback_data: 'kill_크나쉬' },
          { text: '우라무', callback_data: 'kill_우라무' },
        ],
        [
          { text: '세트람', callback_data: 'kill_세트람' },
          { text: '가르투아', callback_data: 'kill_가르투아' },
        ],
        [
          { text: '타르탄', callback_data: 'kill_타르탄' },
          { text: '카샤파', callback_data: 'kill_카샤파' },
        ],
        [
          { text: '라그타', callback_data: 'kill_라그타' },
        ],
        [
          { text: '📋 다음 보스', callback_data: 'next' },
        ]
      ]
    }
  };

  bot.sendMessage(chatId, '아이온2 필드보스 알람봇', keyboard);
});

// 버튼 클릭 처리
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'next') {
    if (Object.keys(bossData).length === 0) {
      bot.sendMessage(chatId, '등록된 보스가 없습니다.');
      return;
    }
    bot.sendMessage(chatId, `📋 다음 보스 순서\n\n${nextList()}`);
    return;
  }

  if (query.data.startsWith('kill_')) {
    const boss = query.data.replace('kill_', '');
    const now = new Date();
    const nextSpawn = new Date(now.getTime() + (BOSSES[boss] || 0) * 1000);

    bossData[boss] = nextSpawn;
    scheduleBoss(chatId, boss);

    bot.sendMessage(
      chatId,
      `✅ ${boss} 등록 완료\n\n다음 젠\n⏰ ${formatTime(nextSpawn)}`
    );
  }
});

bot.onText(/\/next/, (msg) => {
  const chatId = msg.chat.id;
  if (Object.keys(bossData).length === 0) {
    bot.sendMessage(chatId, '등록된 보스가 없습니다.');
    return;
  }
  bot.sendMessage(chatId, `📋 다음 보스 순서\n\n${nextList()}`);
});

console.log('AION2 Boss Bot Running');
