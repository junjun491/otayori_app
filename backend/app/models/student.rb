class Student < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist
  belongs_to :classroom
  has_many :message_deliveries, dependent: :destroy
  has_many :received_messages, through: :message_deliveries, source: :message
end
