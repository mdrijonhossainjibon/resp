const { Schema , model} = require("mongoose");

const userSchema = new Schema({
    chatId: Number, // Assuming chatId is a unique identifier for users
    username: String,
    balances: {
      TONCOIN: { type: Number, default: 0 },
      ARBUZ: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      DRIFT: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now }
  });

 const HistorySchema = new Schema({
  chatId : String,
  symbol : String,
  amount : { type : Number, default :  0},
  type : { type:  String ,enum: ['deposit', 'convert', 'withdraw'], default : 'deposit'},
  txid : { type : String, default :  'null'},
  fee : { type : Number, default :  0},
  status : { type:  String , enum: ['pending', 'processing', 'success', 'fail', 'cancel'],  default : 'pending'},
  timestamp : { type : Date, default :  Date.now()}
}) 

const User = model('User', userSchema);
const HistoryMadel = model('History',HistorySchema)
 module.exports = { User ,HistoryMadel }

  