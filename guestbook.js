
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
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendMessage");
const statusText = document.getElementById("status");
const messagesDiv = document.getElementById("messages");

const messagesRef = collection(db, "messages");

function loadMessages() {
  const q = query(messagesRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    messagesDiv.replaceChildren();

    snapshot.forEach((doc) => {
      const data = doc.data();

      const article = document.createElement("article");
      const name = document.createElement("strong");
      const text = document.createElement("p");

      name.textContent = data.nickname || "匿名";
      text.textContent = data.text || "";

      article.append(name, text);
      messagesDiv.append(article);
    });
  }, (error) => {
    console.error(error);
    statusText.textContent = "即時更新失敗，請查看 Console。";
  });
}


sendButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    statusText.textContent = "請先輸入留言。";
    return;
  }

  sendButton.disabled = true;
  statusText.textContent = "送出中……";

  try {
    // 等待匿名登入完成
    if (!auth.currentUser) {
      throw new Error("匿名登入尚未完成，請稍後再試。");
    }

    const nickname =
      nicknameInput.value.trim() ||
      `匿名#${Math.floor(1000 + Math.random() * 9000)}`;

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
