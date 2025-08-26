# config/routes.rb
Rails.application.routes.draw do
  devise_for :teachers,
             defaults: { format: :json },
             controllers: {
               sessions: "teachers/sessions",
               registrations: "teachers/registrations"
             }

  devise_for :students,
             defaults: { format: :json },
             controllers: {
               sessions: "students/sessions",
               registrations: "students/registrations"
             }

  namespace :teachers do
    get "profile", to: "profiles#show"
  end

  resources :classrooms, only: [ :index, :show, :create ] do
    resources :students, only: [ :index ], module: :classrooms

    resources :invitations, only: [ :create, :index, :show ], module: :classrooms do
      collection do
        get :verify
      end
    end
  end

  scope defaults: { format: :json } do
    resources :classrooms, only: [ :index, :show, :create ] do
      resources :messages, only: [ :index, :create ], module: :classrooms
    end

    resources :messages, only: [ :show ] do
      member do
        post :publish
        post :disable
        delete :destroy
      end
      resources :responses, only: [ :index, :create ], module: :messages
    end
  end
end
