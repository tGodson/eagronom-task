class CalculateHumusBalanceController < ActionController::Base
  skip_before_action :verify_authenticity_token, only: [:create]
  def create
    render plain: CalculateHumusBalanceService.instance.get_farmer_humus_balance(request.body.read)
  end
end