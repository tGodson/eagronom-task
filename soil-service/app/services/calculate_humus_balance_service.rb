class CalculateHumusBalanceService
  include Singleton

  CONSECUTIVE_YEAR_CROP_VALUE = 1.3

  def get_farmer_humus_balance(body)
    return unless body.present?
    seasonal_crops = JSON.parse(body)
    calculate_farmer_humus_balance(seasonal_crops)
  end

  private

  def calculate_farmer_humus_balance(seasonal_crops)
      # Declare the balance

      humus_balance = 0
      cummulative_crop_value = nil

      # Sort the Seasonal Crops so we may multiply by 1.3 each year

      sorted_crops = seasonal_crops.sort_by {|crop| crop['year']}
      sorted_crops = sorted_crops.map{|seasonal_crop| seasonal_crop['crop']}

      # Multiply for each consecutive year

      sorted_crops.each do |crop|
        humus_delta = crop['humus_delta']
        humus_balance += cummulative_crop_value == crop['value'] ? humus_delta * CONSECUTIVE_YEAR_CROP_VALUE : humus_delta
        cummulative_crop_value = crop['value']
      end

      # Return the balance and be a happy farmer

      humus_balance
  
  end
end
