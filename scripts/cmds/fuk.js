const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return response.data.mahmud;
};

module.exports = {
        config: {
                name: "fuk",
                aliases: ["fukvideo", "fuckvid"],
                version: "2.7",
                author: "MahMUD",
                countDown: 10,
                role: 2,
                description: {
                        bn: "র‍্যান্ডম কর্ন এডিট ভিডিও পান",
                        en: "Get a random fuck edit video",
                        vi: "Lấy một video chỉnh sửa ngô ngẫu nhiên"
                },
                category: "nsfw",
                guide: {
                        bn: '   {pn}: একটি র‍্যান্ডম কর্ন ভিডিও দেখতে ব্যবহার করুন',
                        en: '   {pn}: Use to get a random fuck video',
                        vi: '   {pn}: Sử dụng để lấy một video ngô ngẫu nhiên'
                }
        },

        langs: {
                bn: {
                        noVideo: "× কোনো ভিডিও খুঁজে পাওয়া যায়নি",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 fuck 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।\n•WhatsApp: 01836298139"
                },
                en: {
                        noVideo: "× No videos found",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 fuck 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noVideo: "× Không tìm thấy video nàn",
                        success: "Video ngô của cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const filePath = path.join(__dirname, "cache", `fuck_${Date.now()}.mp4`);
                if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const apiUrl = await mahmud();
                        const res = await axios.get(`${apiUrl}/api/segs/mahmud/videos/fuck?userID=${event.senderID}`);
                        
                        if (!res.data.success || !res.data.videos.length) {
                                return message.reply(getLang("noVideo"));
                        }

                        const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
                        const videoRes = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const writer = fs.createWriteStream(filePath);
                        videoRes.data.pipe(writer);

                        writer.on("finish", () => {
                                return message.reply({
                                        body: getLang("success"),
                                        attachment: fs.createReadStream(filePath)
                                }, () => {
                                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                });
                        });

                        writer.on("error", (err) => { throw err; });

                } catch (err) {
                        console.error("Corn Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
