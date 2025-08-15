class Invitation < ApplicationRecord
  belongs_to :classroom

  before_create :issue_token
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  scope :available, -> { where(used: false).where("expires_at IS NULL OR expires_at > ?", Time.current) }

  def expired?
    expires_at.present? && expires_at <= Time.current
  end

  private
  def issue_token
    self.token = SecureRandom.urlsafe_base64(24)
    self.expires_at ||= 7.days.from_now
  end
end
