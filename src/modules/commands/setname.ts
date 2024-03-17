export default class SetNameCommand {
  static config = {
    name: "setname",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "Đổi biệt danh của 1 người",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    if (!args[1] || !event.mentions)
      return api.sendMessage("Vui lòng tag một người!", event.threadID);
    const nickName = event.body.split(Object.values(event.mentions)[0])[1];
    const mention = Object.keys(event.mentions)[0];
    console.log(mention);
    await api.changeNickname(nickName, event.threadID, mention);
    api.sendMessage("Đã đổi tên thành công!");
  }
}
