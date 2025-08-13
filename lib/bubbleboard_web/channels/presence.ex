defmodule BubbleboardWeb.Presence do
  use Phoenix.Presence,
    otp_app: :bubbleboard,
    pubsub_server: Bubbleboard.PubSub
end
