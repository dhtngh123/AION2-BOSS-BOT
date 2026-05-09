const TelegramBot = require('node-telegram-bot-api');
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

    const nextSpawn = new Date(
      now.getTime() + BOSSES[boss] * 1000
    );

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
