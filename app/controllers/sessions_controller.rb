class SessionsController < ApplicationController
  # creates a Session in the db for tracking
  def get
    Session.create!(user_id: params[:user_id])
    render ""
  end

  def update
    Session.find(params[:id]).update! session_params
  end

  private

  def session_params
    params.expect(meta: :car)
  end
end
