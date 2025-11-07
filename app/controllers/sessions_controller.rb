class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token

  # Session is now auto-created by SessionManagement concern
  def index
    # Session already exists via before_action :ensure_session
    render json: { id: current_session.id }
  end

  def show
    render json: current_session
  end

  def update
    current_session.update!(session_params)
    head :ok
  end

  private

  def session_params
    params.require(:session).permit!
  end
end
