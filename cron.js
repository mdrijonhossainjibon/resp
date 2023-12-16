const cron = require('node-cron');
const API_CALL = require('./api');
const { HistoryMadel } = require('./mongoosedata');
const bot = require('./Bot');


// Your other imports and configurations

// Schedule a task to run every minute
cron.schedule('*/1 * * * * *', async () => {
  const transactions = await HistoryMadel.findOne({type : 'deposit', status : 'processing'});
   
   // Function to convert from one currency to another
   /**
    * 
    * @param { Number } amount 
    * @param { 'USDT' | 'DRIFT' } from_symbol 
    * @param { 'USDT'  | 'DRIFT' } to_symbol 
    * @returns 
    */
function convert(amount, from_symbol, to_symbol) {
  const toPrice = Trakers.find((item)=> item.symbol.toLocaleLowerCase().includes(to_symbol.toLocaleLowerCase())).price
  const fromPrice = Trakers.find((item)=> item.symbol.toLocaleLowerCase().includes(from_symbol.toLocaleLowerCase())).price
  return amount * (toPrice / fromPrice);
}

// Prices
const usdtPrice = 1;      // 1 USDT = 1 USD
const trxPrice = 0.00121;   // 1 TRX = 0.095 USD
const solPrice = 100;     // 1 SOL = 100 USD
const Trakers = [{ symbol : 'USDT',price : 1 },{ symbol : 'DRIFT' ,price : 0.00121 }];
 
if(transactions){
const trxToUsdt = convert(transactions.amount, 'USDT', 'DRIFT');
 await HistoryMadel.create({chatId : transactions.chatId,type : 'convert', symbol : 'USDT'  , amount : trxToUsdt,status : 'success'})
  transactions.status = 'success';
  await transactions.save();
}

  
  // Iterate over the transactions array
  transactions.forEach(transaction => {
    // Construct the message with emoji for each transaction
    const htmlMessage =`
    <b>📜 History</b>
    <b>Transaction Details:</b>
    <strong>🆔 ID:</strong> ${transaction._id.slice(5,9)}
    <strong>💬 Chat ID:</strong> ${transaction.chatId}
    <strong>💰 Symbol:</strong> ${transaction.symbol}
    <strong>💲 Amount:</strong> ${transaction.amount} USDT
    <strong>⚖️ Type:</strong> ${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
    <strong>🔄 Transaction ID:</strong> ${transaction.txid !== 'null' ? transaction.txid : 'Not available'}
    <strong>💸 Fee:</strong> ${transaction.fee} USDT
    <strong>📊 Status:</strong> ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
    <strong>🕒 Timestamp:</strong> ${transaction.timestamp}
    `;
  
    // Replace 'USER_CHAT_ID' with the actual chat ID where you want to send the message
    const chatId = '709148502';
  
    // Send the message for each transaction
    ///bot.sendMessage(chatId, htmlMessage,{parse_mode : 'HTML'});
  });
   
});

