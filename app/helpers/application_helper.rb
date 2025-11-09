module ApplicationHelper
  def page_title
    content_for(:title) || "MPG Calculator - Is It Worth Upgrading Your Car?"
  end

  def page_description
    content_for(:description) || "Free MPG calculator to compare car costs. Calculate fuel savings, payments, insurance, and maintenance to determine if upgrading your car is financially worth it."
  end

  def page_keywords
    content_for(:keywords) || "mpg calculator, car upgrade calculator, fuel savings calculator, car cost comparison, gas mileage calculator, car payment calculator, auto cost calculator"
  end

  def page_url
    request.original_url
  end

  def page_image
    content_for(:og_image) || "#{request.base_url}/icon.png"
  end
end
