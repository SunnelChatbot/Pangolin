import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class NameCommand {
  static config = {
    name: "", //your command name
    version: "",
    author: "",
    createdAt: "",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}
  async run({
    api,
    event,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang,
  }) {
    // logic here
  }
  async event({
    api,
    event,
    client,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang,
  }) {
    //no agrs
    // logic
  }
  async noprefix({
    api,
    event,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang,
  }) {
    // logic
  }
}
