defmodule BubbleboardWeb.RoomChannel do
  use BubbleboardWeb, :channel

  alias Bubbleboard.Board.RoomAgent
  alias BubbleboardWeb.Presence

  @impl true
  def join("room:" <> _room_id, %{"user" => user}, socket) do
    # 发送消息以触发 after_join 处理
    send(self(), :after_join)
    {:ok, assign(socket, :user, user)}
  end

  @impl true
  def handle_info(:after_join, socket) do
    user = socket.assigns.user || "匿名"
    {:ok, _} =
      Presence.track(socket, socket.id, %{
        username: user,
        online_at: System.system_time(:second)
      })
    # 发送在线人数
    push(socket, "presence_state", Presence.list(socket))
    push(socket, "message:history", %{messages: RoomAgent.get_state().messages})
    {:noreply, socket}
  end

  @impl true
  def handle_in("draw", payload, socket) do
    broadcast!(socket, "draw", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("message:new", %{"body" => body}, socket) do
    message = %{
      user: socket.assigns.user || "匿名",
      body: body,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    RoomAgent.add_message(message)
    broadcast!(socket, "message:new", message)
    {:noreply, socket}
  end

  @impl true
  def handle_in("user:edit", %{"username" => username}, socket) do
    Presence.update(socket, socket.id, %{
      user: username,
      online_at: System.system_time(:second)
    })
    {:reply, {:ok, %{user: username}}, assign(socket, :user, username)}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
