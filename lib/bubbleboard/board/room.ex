defmodule Bubbleboard.Board.RoomAgent do
  use Agent

  def start_link(_) do
    Agent.start_link(fn -> %{messages: []} end, name: __MODULE__)
  end

  def get_state do
    Agent.get(__MODULE__, & &1)
  end

  def add_message(message) do
    Agent.update(__MODULE__, fn state ->
      %{state | messages: [message | state.messages]}
    end)
  end
end
