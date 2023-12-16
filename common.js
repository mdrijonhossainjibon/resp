const { User }= require("./mongoosedata");

async function getUserBalance(chatId,bot) {
    try {
      const user = await User.findOne({ chatId });
  
      if (user) {
        bot.sendMessage(chatId, `Your current balance: ${user.balances.ARBUZ} ARBUZ`);
        bot.sendMessage(chatId, `Your current balance: ${user.balances.DRIFT} DRIFT`);
        bot.sendMessage(chatId, `Your current balance: ${user.balances.USDT} USDT`);
        bot.sendMessage(chatId, `Your current balance: ${user.balances.TONCOIN} TONCOIN`);
      } else {
        bot.sendMessage(chatId, 'User not found. Please create an account first.');
      }
    } catch (error) {
      console.log(error.message);
      bot.sendMessage(chatId, 'Error getting user balance. =>'+ error.message);
    }
  }
  

  module.exports = getUserBalance