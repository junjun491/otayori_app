FactoryBot.define do
  factory :message do
    association :classroom
    association :sender, factory: :teacher
    title   { "お便りのタイトル" }
    content { "本文サンプルです" }
    status  { :draft }
    target_all { true }
    deadline { 1.week.from_now }
  end
end
