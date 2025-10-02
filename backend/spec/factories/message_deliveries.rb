FactoryBot.define do
  factory :message_delivery do
    association :message
    association :student
    confirmed_at { nil } # 既読状態は必要に応じて上書き
  end
end
