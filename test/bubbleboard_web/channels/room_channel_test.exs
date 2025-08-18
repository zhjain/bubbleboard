defmodule BubbleboardWeb.RoomChannelTest do
  use BubbleboardWeb.ChannelCase

  alias Bubbleboard.Board.RoomAgent

  setup do
    # 确保 RoomAgent 已启动（如果还没有启动的话）
    unless Process.whereis(RoomAgent) do
      start_supervised!(RoomAgent)
    end
    
    {:ok, _, socket} =
      BubbleboardWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(BubbleboardWeb.RoomChannel, "room:lobby", %{"user" => "测试用户"})

    %{socket: socket}
  end

  test "ping replies with status ok", %{socket: socket} do
    ref = push(socket, "ping", %{"hello" => "there"})
    assert_reply ref, :ok, %{"hello" => "there"}
  end

  test "shout broadcasts to room:lobby", %{socket: socket} do
    push(socket, "shout", %{"hello" => "all"})
    assert_broadcast "shout", %{"hello" => "all"}
  end

  test "broadcasts are pushed to the client", %{socket: socket} do
    broadcast_from!(socket, "broadcast", %{"some" => "data"})
    assert_push "broadcast", %{"some" => "data"}
  end

  test "joining sends presence state and message history", %{socket: _socket} do
    assert_push "presence_state", _presence_data
    assert_push "message:history", %{messages: _messages}
  end

  test "message:new broadcasts new message to all users", %{socket: socket} do
    message_body = "Hello, world!"
    
    push(socket, "message:new", %{"body" => message_body})
    
    assert_broadcast "message:new", %{
      user: "测试用户",
      body: ^message_body,
      timestamp: _timestamp
    }
  end

  test "message:new saves message to room state", %{socket: socket} do
    message_body = "Test message"
    initial_messages = RoomAgent.get_state().messages
    
    push(socket, "message:new", %{"body" => message_body})
    
    # 等待消息被处理
    :timer.sleep(10)
    
    updated_messages = RoomAgent.get_state().messages
    assert length(updated_messages) == length(initial_messages) + 1
    
    [latest_message | _] = updated_messages
    assert latest_message.body == message_body
    assert latest_message.user == "测试用户"
  end

  test "user:edit updates username and replies with success", %{socket: socket} do
    new_username = "新用户名"
    
    ref = push(socket, "user:edit", %{"username" => new_username})
    assert_reply ref, :ok, %{user: ^new_username}
  end

  test "draw event broadcasts to all users", %{socket: socket} do
    draw_data = %{
      "x" => 100,
      "y" => 200,
      "color" => "#ff0000",
      "tool" => "pen"
    }
    
    push(socket, "draw", draw_data)
    assert_broadcast "draw", ^draw_data
  end

  test "joining with different room IDs creates separate channels" do
    {:ok, _, socket1} =
      BubbleboardWeb.UserSocket
      |> socket("user1", %{})
      |> subscribe_and_join(BubbleboardWeb.RoomChannel, "room:room1", %{"user" => "用户1"})

    {:ok, _, _socket2} =
      BubbleboardWeb.UserSocket
      |> socket("user2", %{})
      |> subscribe_and_join(BubbleboardWeb.RoomChannel, "room:room2", %{"user" => "用户2"})

    # 在 room1 发送消息
    push(socket1, "message:new", %{"body" => "Room1 message"})
    
    # socket1 应该收到广播
    assert_broadcast "message:new", %{body: "Room1 message"}
  end
end
