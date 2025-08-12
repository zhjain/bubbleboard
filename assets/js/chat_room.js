import { Presence } from "phoenix";
import socket from "./user_socket";

class ChatRoom {
    constructor() {
        this.username = localStorage.getItem("username") || "匿名";
        this.channel = socket.channel("room:lobby", { "user": this.username });
        this.presences = {};
        this.setupChannel();
        this.setupEventListeners();
    }

    setupChannel() {
        this.channel.join()
            .receive("ok", resp => { console.log("Joined successfully", resp); })
            .receive("error", resp => { console.log("Unable to join", resp); });

        const presence = new Presence(this.channel);

        presence.onSync(() => {
            // 获取所有在线用户
            const presences = presence.list((id, presence) => {
                return {
                    id: id,
                    user: presence.metas[0].user,  // 注意：metas 是数组
                    onlineAt: presence.metas[0].online_at
                };
            });

            console.log("当前在线用户:", presences);

            // 更新在线用户数量显示
            const onlineCountElement = document.getElementById("online-count");
            if (onlineCountElement) {
                onlineCountElement.textContent = presences.length;
            }

            // 如果需要存储到组件状态
            this.presences = presences; // 确保 this 指向正确的对象
        });

        this.channel.on("message:new", payload => {
            console.log("New message received:", payload);
            this.displayMessage(payload);
        });
        this.channel.on("message:history", payload => {
            console.log("Message history received:", payload);
            payload.messages.reverse().forEach(message => this.displayMessage(message));
        });
    }

    setupEventListeners() {
        const editUsernameBtn = document.getElementById("edit-username-button");
        const clearUsernameBtn = document.getElementById("clear-username-button");
        const usernameModal = document.getElementById("username-modal");
        const saveBtn = document.getElementById("save-button");
        const usernameInput = document.getElementById("usrnm-input");
        const currentUsernameSpan = document.getElementById("current-username");
        const inputForm = document.getElementById("input-form");

        // 初始化显示当前用户名
        currentUsernameSpan.textContent = this.username;

        // 显示模态框
        editUsernameBtn.addEventListener("click", () => {
            usernameModal.classList.remove("hidden");
            usernameInput.focus();
        });

        // 清除用户名
        clearUsernameBtn.addEventListener("click", () => {
            this.channel.push("user:edit", { username: '匿名' })
                .receive("ok", resp => {
                    console.log("Username updated successfully", resp);
                    currentUsernameSpan.textContent = '匿名';  // 更新页面显示的用户名
                    localStorage.removeItem("username");
                })
        });

        // 点击模态框的“保存”按钮
        saveBtn.addEventListener("click", () => {
            const newUsername = usernameInput.value.trim();
            if (newUsername) {
                this.channel.push("user:edit", { username: newUsername })
                    .receive("ok", resp => {
                        console.log("Username updated successfully", resp);
                        currentUsernameSpan.textContent = newUsername;  // 更新页面显示的用户名
                        localStorage.setItem("username", newUsername);
                        usernameInput.value = "";
                        usernameModal.classList.add("hidden");
                    })
                    .receive("error", resp => {
                        console.log("Failed to update username", resp);
                        // 这里可以提示用户失败信息
                    });
            }
        });

        // 发送消息按钮事件（保留原有逻辑）
        inputForm.addEventListener("submit", (event) => {
            event.preventDefault(); // 阻止表单默认提交行为
            const messageInput = document.getElementById("message-input");
            const message = messageInput.value;
            if (message) {
                this.channel.push("message:new", { body: message })
                    .receive("ok", resp => { console.log("Message sent successfully", resp); })
                    .receive("error", resp => { console.log("Failed to send message", resp); });
                messageInput.value = ""; // Clear input after sending
            }
        });

        // 可选：点击模态框背景关闭模态框
        usernameModal.addEventListener("click", (e) => {
            if (e.target === usernameModal) {
                usernameModal.classList.add("hidden");
            }
        });
    }
    displayMessage(payload) {
        const messagesContainer = document.getElementById("messages-container");
        const messageElement = document.createElement("div");
        messageElement.className = "message";
        messageElement.innerHTML = `<strong>${payload.user}:</strong> ${payload.body}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到底部
    }

}

// 只在聊天页面初始化
if (document.getElementById('messages-container')) {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatRoom()
    })
}

export default ChatRoom;