Rails.application.routes.draw do
  resources :fields, only: [:index]
  resources :crops, only: [:index]
  resources :calculate_humus_balance, only: [:create]
end