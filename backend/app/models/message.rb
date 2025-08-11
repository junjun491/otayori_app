class Message < ApplicationRecord
  belongs_to :classroom
  belongs_to :teacher
  has_many :message_deliveries, dependent: :destroy

  validates :title, :content, :status, presence: true

  enum status: { draft: 0, sent: 1, disabled: 2 }
end
