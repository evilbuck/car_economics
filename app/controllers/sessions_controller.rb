class SessionsController < ApplicationController
  # creates a Session in the db for tracking
  def index
    Session.create!(user_id: params[:user_id])
    head :ok
  end

  def update
    Session.find(params[:id]).update! session_params
    head :ok
  end

  private

  def session_params
    params.permit(meta: { car: {} })
  end
end
