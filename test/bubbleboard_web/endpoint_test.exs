defmodule BubbleboardWeb.EndpointTest do
  use ExUnit.Case, async: true
  use BubbleboardWeb.ConnCase

  test "health check endpoint responds" do
    # 测试基本的端点功能
    conn = build_conn()
    conn = get(conn, "/")
    assert conn.status == 200
  end

  test "static assets are served" do
    conn = build_conn()
    conn = get(conn, "/images/logo.svg")
    assert conn.status == 200
  end

  test "robots.txt is accessible" do
    conn = build_conn()
    conn = get(conn, "/robots.txt")
    assert conn.status == 200
  end
end