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
    resources :invitations, only: [ :create, :index, :show ], module: :classrooms do
      member do
        get :verify  # => /classrooms/:classroom_id/invitations/verify
      end
    end
  end
end
