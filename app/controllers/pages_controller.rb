class PagesController < ApplicationController
  ALLOWED_PAGES = %w[mpg_calculator]

  def get_page_by_name
    page = params[:page_name]

    raise ActionController::RoutingError, 'Not Found' unless is_allowed(page)

    render page
  end

  private

  def is_allowed(page)
    return ALLOWED_PAGES.include?(page)
  end
end
