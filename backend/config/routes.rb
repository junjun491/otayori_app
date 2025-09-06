Rails.application.routes.draw do
  scope defaults: { format: :json } do
    devise_for :teachers,
               controllers: {
                 sessions: "teachers/sessions",
                 registrations: "teachers/registrations"
               }

    devise_for :students,
               controllers: {
                 sessions: "students/sessions",
                 registrations: "students/registrations"
               }

    namespace :teachers do
      get "profile", to: "profiles#show"
    end

    resources :classrooms, only: [ :index, :show, :create ] do
      resources :students, only: [ :index ], module: :classrooms

      resources :invitations, only: [ :index, :show, :create ], module: :classrooms do
        collection { get :verify } # /classrooms/:classroom_id/invitations/verify
      end

      resources :messages, only: [ :index, :show, :create ], module: :classrooms do
        member do
          post :publish
          post :disable
          delete :destroy
        end

        resource :response, only: [ :show, :create, :update ], module: :messages
      end
    end

    # 生徒用: 自分の受信メッセージ一覧
    get "/my/inbox", to: "inbox#index"

    resources :messages, only: [ :show ], controller: "my/messages" do
      post :read,     on: :member
      post :response, on: :member
    end
  end
end
