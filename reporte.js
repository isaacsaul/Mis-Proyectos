const fs = require('fs');
const xlsx = require('xlsx');

async function saveConversationToExcel(conversationLog) {
  const worksheetData = conversationLog.map((entry, index) => ({
    "Index": index + 1,
    "From": entry.from,
    "Message": entry.body,
    "Timestamp": entry.timestamp.toISOString(),
    "Sender": entry.sender
  }));

  const worksheet = xlsx.utils.json_to_sheet(worksheetData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Conversación');

  xlsx.writeFile(workbook, 'conversation_log.xlsx');
  console.log('Conversación guardada en conversation_log.xlsx');
}

module.exports = {
  saveConversationToExcel
};
