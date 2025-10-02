FactoryBot.define do
  factory :student do
    association :classroom
    name  { Faker::Name.name }
    email { Faker::Internet.email }
    password { 'password123' }
  end
end
