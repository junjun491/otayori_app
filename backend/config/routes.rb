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
               sessions: "students/sessions"
             }

  namespace :teachers do
    get "profile", to: "profiles#show"
  end

  resources :classrooms, only: [:show, :create, :update, :destroy]
  resources :messages, only: [:create, :index, :show]
end
