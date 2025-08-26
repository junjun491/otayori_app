class InvitationMailer < ApplicationMailer
    default from: ENV.fetch("MAIL_FROM", "no-reply@example.com")

    def invite(invitation)
      @invitation = invitation
      @signup_url = ::FrontendUrl.signup_student(invitation)
      mail(to: invitation.email, subject: "\u3010\u304A\u4FBF\u308A\u7BA1\u7406\u3011\u30AF\u30E9\u30B9\u62DB\u5F85\u306E\u304A\u77E5\u3089\u305B")
    end
end
