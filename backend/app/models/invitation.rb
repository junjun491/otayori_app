# app/models/invitation.rb
class Invitation < ApplicationRecord
  belongs_to :classroom

  before_validation :generate_token, on: :create
  before_create :set_default_expiry
  after_commit :enqueue_invite_mail, on: :create

  scope :usable, -> { where(used: false).where("expires_at IS NULL OR expires_at > ?", Time.current) }

  validates :token, presence: true

  def usable?
    !used && (expires_at.nil? || expires_at.future?)
  end

  def mark_used!
    update!(used: true, used_at: Time.current)
  end

  private

  # ★ 常に新規トークンを採番（外部からの値は無視）
  def generate_token
    5.times do
      self.token = SecureRandom.urlsafe_base64(24)
      break unless self.class.exists?(token: token)
    end
    token || (raise "TokenGenerationFailed")
  end

  def set_default_expiry
    self.expires_at ||= 7.days.from_now
  end

  def enqueue_invite_mail
    return unless ENV["MAIL_REAL_SEND"] == "true"
    InvitationMailer.invite(self).deliver_later(queue: :mailers)
  end
end
