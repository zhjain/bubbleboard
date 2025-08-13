defmodule BubbleboardWeb.Router do
  use BubbleboardWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {BubbleboardWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :put_user_token
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", BubbleboardWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  def put_user_token(conn, _) do
    assign(conn, :user_token, short_uuid())
  end

  defp short_uuid() do
    uuid = UUID.uuid4()
    hex_str = uuid |> String.replace("-", "") |> String.slice(0, 12)

    {int, ""} = Integer.parse(hex_str, 16)

    int
    |> Integer.to_string(36)
    |> String.downcase()
  end

  # Other scopes may use custom stacks.
  # scope "/api", BubbleboardWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:bubbleboard, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: BubbleboardWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
