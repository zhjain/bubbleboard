defmodule BubbleboardWeb.UserSocketTest do
  use BubbleboardWeb.ChannelCase

  alias BubbleboardWeb.UserSocket

  test "socket connection with valid token" do
    assert {:ok, socket} = connect(UserSocket, %{"token" => "valid_token"})
    assert socket.assigns.user_token == "valid_token"
  end

  test "socket connection with invalid params" do
    assert_raise FunctionClauseError, fn ->
      connect(UserSocket, %{})
    end
  end

  test "socket assigns user_token" do
    {:ok, socket} = connect(UserSocket, %{"token" => "test_token"})
    assert socket.assigns.user_token == "test_token"
  end
end