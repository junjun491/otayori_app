class MessageDelivery < ApplicationRecord
  belongs_to :message
  belongs_to :recipient, class_name: "Student", foreign_key: :student_id
  has_one :message_response, dependent: :destroy

  validates :student_id, uniqueness: { scope: :message_id }
end
