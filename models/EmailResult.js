const mongoose = require('mongoose');

const EmailResultSchema = new mongoose.Schema({
  recipient: String,       // one of the 5 test emails
  sender: String,
  senderName: String,      // user input email
  subject: String,
  folder: String,          // Inbox or Spam
  receivedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('EmailResult', EmailResultSchema);
