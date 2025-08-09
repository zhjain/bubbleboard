defmodule Bubbleboard.Chat.Room do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> %{messages: [], online_users: %{}} end, name: __MODULE__)
  end

end
