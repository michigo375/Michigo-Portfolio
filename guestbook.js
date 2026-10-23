
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const nicknameInput = document.getElementById("nickname");
// 讀取上次使用的暱稱
nicknameInput.value = localStorage.getItem("guestbookNickname") || "";

// 使用者輸入時，自動記住暱稱
nicknameInput.addEventListener("input", () => {
  const nickname = nicknameInput.value.trim();

  if (nickname) {
    localStorage.setItem("guestbookNickname", nickname);
  } else {
    localStorage.removeItem("guestbookNickname");
  }
});
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendMessage");
const statusText = document.getElementById("status");
const messagesDiv = document.getElementById("messages");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let allMessages = [];
let currentPage = 1;
const PAGE_SIZE = 50;

const messagesRef = collection(db, "messages");


function loadMessages() {
  const q = query(messagesRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    allMessages = snapshot.docs.map((doc) => doc.data());

    const totalPages = Math.max(1, Math.ceil(allMessages.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    renderMessages();
  }, (error) => {
    console.error(error);
    statusText.textContent = "即時更新失敗，請查看 Console。";
  });
}


function renderMessages() {
  const totalPages = Math.max(1, Math.ceil(allMessages.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageMessages = allMessages.slice(startIndex, startIndex + PAGE_SIZE);

  messagesDiv.replaceChildren();

  pageMessages.forEach((data) => {
    const article = document.createElement("article");
    const name = document.createElement("strong");
    const text = document.createElement("p");
    const time = document.createElement("div");

    name.textContent = data.nickname || "匿名";
    text.textContent = data.text || "";

    if (data.createdAt) {
      const date = data.createdAt.toDate();
      time.textContent = date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    } else {
      time.textContent = "時間未知";
    }

    time.className = "message-time";

    article.append(name, text, time);
    messagesDiv.append(article);
  });

  pageInfo.textContent = `- ${currentPage} -`;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}
// 上一頁
prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderMessages();
  }
});

// 下一頁
nextPageButton.addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(allMessages.length / PAGE_SIZE)
  );

  if (currentPage < totalPages) {
    currentPage++;
    renderMessages();
  }
});



const animals = [
  "猴子", "大象", "企鵝", "狐狸", "水豚",
  "貓咪", "熊貓", "章魚", "海豹", "兔子",
  "長頸鹿", "柴犬", "河馬", "袋鼠", "鯨魚"
];

const anonymousNickname =
  `匿名 ${animals[Math.floor(Math.random() * animals.length)]}`;

sendButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    statusText.textContent = "請先輸入留言。";
    return;
  }

  sendButton.disabled = true;
  statusText.textContent = "Sending……";

  try {
    // 等待匿名登入完成
    if (!auth.currentUser) {
      throw new Error("匿名登入尚未完成，請稍後再試。");
    }

    
const animals = [
  "猴子", "大象", "企鵝", "狐狸", "水豚",
  "貓咪", "熊貓", "章魚", "海豹", "兔子",
  "長頸鹿", "柴犬", "河馬", "袋鼠", "鯨魚"
];

const nickname =
  nicknameInput.value.trim() || anonymousNickname;


    await addDoc(messagesRef, {
      nickname,
      text,
      imageUrl: "",
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    messageInput.value = "";
    statusText.textContent = "留言成功！";
    await loadMessages();
  } catch (error) {
    console.error(error);
    statusText.textContent = "留言失敗，請稍後再試。";
  } finally {
    sendButton.disabled = false;
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    loadMessages();
  }
});
