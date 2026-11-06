
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

  // 分享按鈕
  const shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.className = "message-share-button";
  shareButton.textContent = "Share";

  shareButton.addEventListener("click", () => {
  openShare(data);
  });

  article.append(name, text, time, shareButton);
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
    statusText.textContent = "電波入力必要!";
    return;
  }

  sendButton.disabled = true;
  statusText.textContent = "発信中……";

  try {
    // 等待匿名登入完成
    if (!auth.currentUser) {
      throw new Error("匿名登入尚未完成，請稍後再試。");
    }



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
    statusText.textContent = "Success！";
    await loadMessages();
  } catch (error) {
    console.error(error);
    statusText.textContent = "Error";
  } finally {
    sendButton.disabled = false;
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    loadMessages();
  }
});
// 留言板注意事項視窗
const noticeOverlay = document.getElementById("guestbook-notice-overlay");
const noticeClose = document.getElementById("guestbook-notice-close");
const noticeConfirm = document.getElementById("guestbook-notice-confirm");

function closeNotice() {
  noticeOverlay.style.display = "none";
}

noticeClose.addEventListener("click", closeNotice);
noticeConfirm.addEventListener("click", closeNotice);


/* ===== 留言分享功能 ===== */

const shareOverlay = document.getElementById("share-overlay");
const shareClose = document.getElementById("share-close");
const shareText = document.getElementById("share-text");
const shareNickname = document.getElementById("share-nickname");
const shareTime = document.getElementById("share-time");
const shareDownload = document.getElementById("share-download");
const shareStatus = document.getElementById("share-status");

function openShare(data) {
  shareText.textContent = data.text || "";
  shareNickname.textContent =
    "FROM　" + (data.nickname || "匿名");

  if (data.createdAt) {
    const date = data.createdAt.toDate();

    shareTime.textContent =
      "RECEIVED · " +
      date.toLocaleString("sv-SE", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).replace(" ", " ");
  } else {
    shareTime.textContent = "RECEIVED · TIME UNKNOWN";
  }

  shareStatus.textContent = "";
  shareOverlay.hidden = false;
}

function closeShare() {
  shareOverlay.hidden = true;
}

shareClose.addEventListener("click", closeShare);

shareOverlay.addEventListener("click", (event) => {
  if (event.target === shareOverlay) {
    closeShare();
  }
});

shareDownload.addEventListener("click", async () => {
  if (typeof window.html2canvas !== "function") {
    shareStatus.textContent = "圖片工具載入失敗，請重新整理頁面。";
    return;
  }

  shareDownload.disabled = true;
  shareStatus.textContent = "正在產生圖片……";

  try {
    await document.fonts.ready;

    const card = document.getElementById("share-card");

    const canvas = await window.html2canvas(card, {
      scale: 2,
      backgroundColor: "#10151d",
      useCORS: true
    });

    const link = document.createElement("a");
    link.download = "signal-observatory.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    shareStatus.textContent = "圖片已產生，請確認下載結果。";
  } catch (error) {
    console.error(error);
    shareStatus.textContent = "圖片產生失敗，請稍後再試。";
  } finally {
    shareDownload.disabled = false;
  }
});
