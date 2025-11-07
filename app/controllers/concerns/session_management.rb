module SessionManagement
  extend ActiveSupport::Concern

  included do
    before_action :ensure_session
  end

  private

  def ensure_session
    @current_session = find_or_create_session
  end

  def find_or_create_session
    session_id = cookies.encrypted[:session_id]

    if session_id
      Session.find_by(id: session_id) || create_new_session
    else
      create_new_session
    end
  end

  def create_new_session
    new_session = Session.create!(user_id: nil, meta: {})
    cookies.encrypted[:session_id] = {
      value: new_session.id,
      expires: 1.year.from_now,
      httponly: true,
      secure: Rails.env.production?
    }
    new_session
  end

  def current_session
    @current_session
  end
end
