class MessageResponse < ApplicationRecord
  belongs_to :message_delivery
  enum :status, { draft: 0, submitted: 1 }

  validate :respect_deadline

  def save_form!(data:, submit: false, at: Time.current)
    self.form_data = data
    if submit
      self.status = :submitted
      self.responded_at = at
    end
    save!
  end

  private

  def respect_deadline
    msg = message_delivery.message
    return unless msg.deadline.present? && submitted?
    if responded_at && responded_at.to_date > msg.deadline
      errors.add(:base, "\u56DE\u7B54\u671F\u9650\u3092\u904E\u304E\u3066\u3044\u307E\u3059")
    end
  end
end
