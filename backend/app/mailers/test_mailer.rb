class TestMailer < ApplicationMailer
    def hello
        to = ENV.fetch('TEST_MAIL_TO', nil) || 'あなたの実在するGmail等のアドレス'
        mail(to: to, subject: 'SendGridテスト') do |format|
          format.text { render plain: 'これはSendGridからのテストメールです。' }
        end
    end
end
