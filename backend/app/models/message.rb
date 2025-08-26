class Message < ApplicationRecord
  belongs_to :classroom
  belongs_to :sender, class_name: "Teacher", foreign_key: "teacher_id"

  has_many :message_deliveries, dependent: :destroy
  has_many :recipients, through: :message_deliveries, source: :recipient

  enum status: { draft: 0, published: 1, disabled: 2 }

  validates :title, :content, presence: true

  scope :recent, -> { order(created_at: :desc) }

  def publish!(recipient_ids: nil, at: Time.current)
    transaction do
      update!(status: :published, published_at: at)
      attach_deliveries!(recipient_ids)
    end
  end

  def disable!
    update!(status: :disabled)
  end

  def deletable?
    return false if published? && published_at && published_at > 30.days.ago
    true
  end

  private

  def attach_deliveries!(recipient_ids)
    ids =
      if target_all || recipient_ids.blank?
        classroom.students.pluck(:id)
      else
        classroom.students.where(id: recipient_ids).pluck(:id)
      end
    ids.each do |sid|
      message_deliveries.find_or_create_by!(student_id: sid)
    end
  end
end
