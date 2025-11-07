require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  test "creates a new session when user_id is provided" do
    assert_difference("Session.count", 1) do
      get sessions_path, params: { user_id: 123 }
    end

    assert_response :ok
    assert_empty response.body

    session = Session.last
    assert_equal 123, session.user_id
  end

  test "creates a new session with nil user_id when not provided" do
    assert_difference("Session.count", 1) do
      get sessions_path
    end

    assert_response :ok
    assert_empty response.body

    session = Session.last
    assert_nil session.user_id
  end

  test "updates an existing session with car metadata" do
    session = sessions(:one)
    car_data = {
      make: "Toyota",
      model: "Camry",
      year: "2020"
    }

    assert_no_difference("Session.count") do
      patch session_path(session), params: { meta: { car: car_data } }
    end

    assert_response :ok
    assert_empty response.body

    session.reload
    assert_equal car_data.stringify_keys, session.meta["car"]
  end

  test "handles non-existent session gracefully" do
    car_data = {
      make: "Honda",
      model: "Civic",
      year: "2021"
    }

    # The controller will raise ActiveRecord::RecordNotFound which Rails handles
    patch session_path(id: 99999), params: { meta: { car: car_data } }

    assert_response :not_found
  end

  test "updates with empty params when no data provided" do
    session = sessions(:one)

    # With permit, missing params just result in empty hash
    patch session_path(session), params: { wrong_param: "value" }

    assert_response :ok
    session.reload
    # meta remains unchanged or becomes empty hash
    assert session.meta.nil? || session.meta.empty? || session.meta == { "car" => nil }
  end

  test "updates with partial data when car key is missing" do
    session = sessions(:one)

    # With permit, missing car key just means car will be nil
    patch session_path(session), params: { meta: { wrong_key: "value" } }

    assert_response :ok
    session.reload
    # car key either doesn't exist or is nil
    assert session.meta.nil? || session.meta["car"].nil?
  end
end
