Rails.application.routes.draw do
  scope defaults: { format: :json } do
    get "/healthz", to: "healthz#show"
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

    namespace :my do
      get "/inbox", to: "inbox#index"
      resources :messages, only: [ :index, :show ] do
        # 既読は副作用のある作成系が安全
        # PUTにして冪等にしても良い（同じ結果を返す）
        post :confirmed,  on: :member   # 既読（既読レコード作成）
        put  :response, on: :member   # 回答の新規/更新（冪等）
      end
    end
  end
end
