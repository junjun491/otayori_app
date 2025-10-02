FactoryBot.define do
  factory :teacher do
    name  { Faker::Name.name }
    email { Faker::Internet.email }
    password { 'password123' }
  end
end
