import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import fs from 'fs';
import { join } from 'path';

export default class AutokickCommand {
  static config = {
    name: "autokick",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description: "Khi thành viên trong nhóm bất kỳ gõ từ cấm quá 3 lần sẽ bị xóa ra khỏi nhóm."
  };

  constructor(private client) {}

  async event(
    api: Ifca,
    event: IEvent,
    client,
    args
  ) {
    try {
      const filePath = join(process.cwd(), `/src/db/data/autokick.json`);
      const encoding = 'utf8';

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{"Trangthai": "on", "tukhoa": [], "userId": {}}', 'utf-8');
      }

      const fileData = fs.readFileSync(filePath, encoding);
      const jsonData = JSON.parse(fileData);

      if (jsonData.Trangthai === "off") {
        return;
      }

      let inappropriateKeywords = [];
      try {
        inappropriateKeywords = jsonData.tukhoa || [];
      } catch (error) {
        console.error(error);
      }

      if (event && event.body) {
        const { senderID, threadID } = event;
        const messageContent = event.body.toLowerCase();

        for (const keyword of inappropriateKeywords) {
          if (typeof keyword === 'string' && messageContent.includes(keyword)) {
            try {
              const userId = senderID.toString();
              const kickCount = jsonData.userId[userId] || 0;
              const threadInfo: any = await new Promise((resolve, reject) => {
                api.getThreadInfo(event.threadID, (err, info) => {
                  if (err) reject(err);
                  else resolve(info);
                });
              });
              const senderInfo = (
                await threadInfo.userInfo.find((info) => info.id === userId)
              ).name; 
              if (kickCount >= 3) {
                const result = await api.removeUserFromGroup(userId, threadID);
                if (result.success) {
                  await api.sendMessage(`✅ ${senderInfo} đã bị xóa khỏi nhóm do vi phạm quá nhiều lần.`, threadID);
                  delete jsonData.userId[userId];
                  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
                } else {
                  console.error(`Failed to remove user ${senderInfo} from group ${threadID}`);
                }
              } else {
                jsonData.userId[userId] = kickCount + 1;
                fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
                await api.sendMessage(`✅ Ghi nhận lỗi vi phạm từ người dùng ${senderInfo}. Số lần vi phạm: ${kickCount + 1}/3`, threadID);
              }
            } catch (error) {
              console.error(error);
            }
            break; 
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }


  async run(
    api: Ifca,
    event: IEvent,
    client,
    args
  ) {
    const { threadID } = event;
    const filePath = join(process.cwd(), `/src/db/data/autokick.json`);

    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{"Trangthai": "on", "tukhoa": [], "userId": {}}', 'utf-8');
      }

      const fileData = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileData);

      if (args[1] === "on") {
        jsonData.Trangthai = "on";
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
        await api.sendMessage(`Đã bật tính năng tự động kiểm tra từ cấm.`, threadID);
      } else if (args[1] === "off") {
        jsonData.Trangthai = "off";
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
        await api.sendMessage(`Đã tắt tính năng tự động kiểm tra từ cấm.`, threadID);
      } else {
        await api.sendMessage("Lệnh không hợp lệ. Vui lòng sử dụng 'autokick on' hoặc 'autokick off'.", threadID);
      }
    } catch (error) {
      console.error(error);
      await api.sendMessage("Đã xảy ra lỗi khi thực hiện yêu cầu.", threadID);
    }
  }
}
