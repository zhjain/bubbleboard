defmodule BubbleboardWeb.BoardLive do
  use BubbleboardWeb, :live_view

  def mount(_params, _session, socket) do
    messages = []

    {:ok,
     assign(socket,
       messages: messages,
       name: "",
       editing_name: false
     )}
  end

  # 点击编辑图标进入编辑模式
  def handle_event(:edit_name, _params, socket) do
    {:noreply, assign(socket, editing_name: true)}
  end

  # 取消编辑
  def handle_event("cancel_edit", _params, socket) do
    {:noreply, assign(socket, editing_name: false)}
  end

  # 失焦时保存用户名
  def handle_event("save_name", %{"value" => name}, socket) do
    trimmed_name = String.trim(name)
    {:noreply, assign(socket, name: trimmed_name, editing_name: false)}
  end

  # 处理键盘事件
  def handle_event("handle_name_key", %{"key" => "Enter", "value" => name}, socket) do
    trimmed_name = String.trim(name)
    {:noreply, assign(socket, name: trimmed_name, editing_name: false)}
  end

  def handle_event("handle_name_key", %{"key" => "Escape"}, socket) do
    # ESC 键取消编辑，恢复原值
    {:noreply, assign(socket, editing_name: false)}
  end

  def handle_event("handle_name_key", _params, socket) do
    # 其他按键不处理
    {:noreply, socket}
  end

  def handle_event("send_message", %{"name" => name, "message" => message}, socket) do
    IO.inspect(message, label: "Received message")
    username = if name == "" or is_nil(name), do: "匿名", else: name
    IO.inspect(username, label: "From: ")
    messages = socket.assigns.messages ++ [%{username: username, content: message}]
    {:noreply, assign(socket, messages: messages, name: name)}
  end
end
