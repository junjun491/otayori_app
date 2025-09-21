class MessageDelivery < ApplicationRecord
  belongs_to :message
  belongs_to :student, foreign_key: :student_id
  has_one :message_response, dependent: :destroy

  validates :student_id, uniqueness: { scope: :message_id }
end
