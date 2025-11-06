class PagesController < ApplicationController
  def get_page_by_name
    page = params[:page_name]

    render page
  end
end
