defmodule Bubbleboard.Board.RoomAgentTest do
  use ExUnit.Case, async: false

  alias Bubbleboard.Board.RoomAgent

  setup do
    # 清理现有状态，重置为初始状态
    Agent.update(RoomAgent, fn _state -> %{messages: []} end)
    :ok
  end

  test "initial state has empty messages list" do
    state = RoomAgent.get_state()
    assert state.messages == []
  end

  test "add_message adds message to the beginning of the list" do
    message1 = %{
      user: "用户1",
      body: "第一条消息",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    message2 = %{
      user: "用户2", 
      body: "第二条消息",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    RoomAgent.add_message(message1)
    RoomAgent.add_message(message2)

    state = RoomAgent.get_state()
    assert length(state.messages) == 2
    
    # 新消息应该在列表开头
    [latest_message, older_message] = state.messages
    assert latest_message == message2
    assert older_message == message1
  end

  test "messages persist across multiple operations" do
    messages = [
      %{user: "用户1", body: "消息1", timestamp: DateTime.utc_now() |> DateTime.to_iso8601()},
      %{user: "用户2", body: "消息2", timestamp: DateTime.utc_now() |> DateTime.to_iso8601()},
      %{user: "用户3", body: "消息3", timestamp: DateTime.utc_now() |> DateTime.to_iso8601()}
    ]

    Enum.each(messages, &RoomAgent.add_message/1)

    state = RoomAgent.get_state()
    assert length(state.messages) == 3

    # 验证消息顺序（最新的在前面）
    [msg3, msg2, msg1] = state.messages
    assert msg3.body == "消息3"
    assert msg2.body == "消息2"
    assert msg1.body == "消息1"
  end
end