FactoryBot.define do
  factory :classroom do
    association :teacher
    name { "1年A組" }
  end
end
