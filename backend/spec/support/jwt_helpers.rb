# spec/support/jwt_helpers.rb
module JwtHelpers
  def auth_headers_for(user, extra_headers = { 'Accept' => 'application/json' })
    token = JwtIssuer.issue(user) # ← 自前で発行
    extra_headers.merge('Authorization' => "Bearer #{token}")
  end
end

RSpec.configure { |c| c.include JwtHelpers }
